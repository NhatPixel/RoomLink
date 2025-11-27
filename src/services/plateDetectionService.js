import * as ort from 'onnxruntime-web';

let modelSession = null;
let isModelLoading = false;

const MODEL_INPUT_SIZE = 640;
const MODEL_PATH = '/plate-api-models/plate_detection.onnx';

let modelUrl = null;
try {
  modelUrl = new URL(MODEL_PATH, import.meta.url).href;
} catch (e) {
  modelUrl = MODEL_PATH;
}

async function loadModel() {
  if (modelSession) return modelSession;
  if (isModelLoading) {
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return modelSession;
  }

  try {
    isModelLoading = true;
    
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
    ort.env.wasm.proxy = false;
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
    
    ort.env.logLevel = 'error';
    
    const pathsToTry = [
      `${window.location.origin}${MODEL_PATH}`,
      MODEL_PATH,
      modelUrl
    ];
    
    let modelData = null;
    let lastError = null;
    
    for (const url of pathsToTry) {
      try {
        console.log('Fetching ONNX model from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/octet-stream, */*'
          },
          cache: 'default'
        });
        
        console.log('Response status:', response.status, response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        if (!response.ok) {
          const text = await response.text();
          console.error('Error response:', text.substring(0, 200));
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const text = await response.text();
          console.error('Received HTML:', text.substring(0, 500));
          throw new Error('Received HTML instead of ONNX model');
        }
        
        const clonedResponse = response.clone();
        const firstBytes = await clonedResponse.arrayBuffer().then(buf => {
          const view = new Uint8Array(buf.slice(0, 4));
          return Array.from(view).map(b => b.toString(16).padStart(2, '0')).join(' ');
        });
        
        console.log('First 4 bytes (hex):', firstBytes);
        
        if (firstBytes.startsWith('3c 21') || firstBytes.includes('3c 21')) {
          const text = await response.text();
          console.error('File is HTML:', text.substring(0, 500));
          throw new Error('File appears to be HTML, not ONNX binary');
        }
        
        modelData = await response.arrayBuffer();
        console.log('Model size:', (modelData.byteLength / (1024 * 1024)).toFixed(2), 'MB');
        
        if (modelData.byteLength === 0) throw new Error('Model file is empty');
        
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Failed to fetch from ${url}:`, err.message);
        continue;
      }
    }
    
    if (!modelData) {
      throw lastError || new Error('Failed to fetch model from all paths');
    }
    
    console.log('Creating ONNX InferenceSession...');
    
    const providers = ['webgl', 'wasm'];
    let backendError = null;
    
    for (const provider of providers) {
      try {
        console.log(`Trying ${provider} backend...`);
        modelSession = await ort.InferenceSession.create(modelData, {
          executionProviders: [provider],
          graphOptimizationLevel: 'all',
        });
        console.log(`✓ ${provider} backend loaded successfully`);
        break;
      } catch (err) {
        backendError = err;
        console.warn(`${provider} backend failed:`, err.message);
        continue;
      }
    }
    
    if (!modelSession) {
      throw backendError || new Error('All backends failed');
    }
    
    console.log('ONNX model loaded successfully');
    isModelLoading = false;
    return modelSession;
  } catch (error) {
    isModelLoading = false;
    console.error('Error loading ONNX model:', error);
    throw error;
  }
}

function preprocessImage(image, targetSize = MODEL_INPUT_SIZE) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  const imgAspect = image.width / image.height;
  let drawWidth, drawHeight, offsetX, offsetY;
  
  if (imgAspect > 1) {
    drawWidth = targetSize;
    drawHeight = targetSize / imgAspect;
    offsetX = 0;
    offsetY = (targetSize - drawHeight) / 2;
  } else {
    drawWidth = targetSize * imgAspect;
    drawHeight = targetSize;
    offsetX = (targetSize - drawWidth) / 2;
    offsetY = 0;
  }
  
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;
  const chwData = new Float32Array(3 * targetSize * targetSize);
  
  for (let i = 0; i < targetSize * targetSize; i++) {
    const r = data[i * 4] / 255.0;
    const g = data[i * 4 + 1] / 255.0;
    const b = data[i * 4 + 2] / 255.0;
    chwData[i] = r;
    chwData[i + targetSize * targetSize] = g;
    chwData[i + 2 * targetSize * targetSize] = b;
  }
  
  return {
    tensor: new ort.Tensor('float32', chwData, [1, 3, targetSize, targetSize]),
    scaleX: image.width / drawWidth,
    scaleY: image.height / drawHeight,
    offsetX,
    offsetY
  };
}

function applyNMS(boxes, scores, iouThreshold = 0.45, scoreThreshold = 0.25) {
  const indices = [];
  const sortedIndices = scores
    .map((score, index) => ({ score, index }))
    .filter(item => item.score >= scoreThreshold)
    .sort((a, b) => b.score - a.score)
    .map(item => item.index);

  while (sortedIndices.length > 0) {
    const current = sortedIndices.shift();
    indices.push(current);

    for (let i = sortedIndices.length - 1; i >= 0; i--) {
      const idx = sortedIndices[i];
      const iou = calculateIoU(boxes[current], boxes[idx]);
      if (iou > iouThreshold) {
        sortedIndices.splice(i, 1);
      }
    }
  }

  return indices.map(idx => ({
    box: boxes[idx],
    score: scores[idx]
  }));
}

function calculateIoU(box1, box2) {
  const x1 = Math.max(box1.x1, box2.x1);
  const y1 = Math.max(box1.y1, box2.y1);
  const x2 = Math.min(box1.x2, box2.x2);
  const y2 = Math.min(box1.y2, box2.y2);

  if (x2 < x1 || y2 < y1) return 0;

  const intersection = (x2 - x1) * (y2 - y1);
  const area1 = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
  const area2 = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
  const union = area1 + area2 - intersection;

  return union > 0 ? intersection / union : 0;
}

function parseYOLOOutput(output, scaleX, scaleY, offsetX, offsetY, originalWidth, originalHeight) {
  const boxes = [];
  const scores = [];
  
  let outputData;
  let outputShape;
  
  if (output instanceof ort.Tensor) {
    outputData = output.data;
    outputShape = output.dims;
  } else if (output && typeof output === 'object') {
    const outputKey = Object.keys(output)[0];
    outputData = output[outputKey].data;
    outputShape = output[outputKey].dims;
  } else {
    return { boxes, scores };
  }
  
  console.log('Output shape:', outputShape);
  console.log('Output data length:', outputData.length);
  
  const batchSize = outputShape[0] || 1;
  const dim1 = outputShape[1] || 0;
  const dim2 = outputShape[2] || 0;
  
  let numDetections, numValues;
  
  if (outputShape.length === 3) {
    if (dim1 === 5 && dim2 === 8400) {
      numDetections = dim2;
      numValues = dim1;
      console.log('YOLOv11 format detected: [batch, 5, 8400]');
    } else if (dim1 === 8400 && dim2 === 5) {
      numDetections = dim1;
      numValues = dim2;
      console.log('YOLOv11 format detected: [batch, 8400, 5]');
    } else {
      numDetections = dim1;
      numValues = dim2 || 6;
      console.log(`Standard format: [batch, ${numDetections}, ${numValues}]`);
    }
  } else {
    numDetections = outputShape[1] || outputShape[0];
    numValues = outputShape[2] || 6;
  }
  
  console.log(`Parsing: batch=${batchSize}, detections=${numDetections}, values=${numValues}`);
  console.log('First 20 values:', Array.from(outputData.slice(0, 20)));
  
  if (outputShape[1] === 5 && outputShape[2] === 8400) {
    const confStartIdx = 8400 * 4;
    const confValues = Array.from(outputData.slice(confStartIdx, confStartIdx + 8400));
    const maxConf = Math.max(...confValues);
    const maxConfIdx = confValues.indexOf(maxConf);
    console.log('First 20 confidence values:', confValues.slice(0, 20));
    console.log(`Max confidence: ${maxConf.toFixed(4)} at index ${maxConfIdx}`);
    console.log('Min confidence:', Math.min(...confValues));
    
    if (maxConfIdx >= 0) {
      const x1Val = outputData[maxConfIdx];
      const y1Val = outputData[8400 + maxConfIdx];
      const x2Val = outputData[8400 * 2 + maxConfIdx];
      const y2Val = outputData[8400 * 3 + maxConfIdx];
      console.log(`Best detection (idx ${maxConfIdx}): x1=${x1Val.toFixed(2)}, y1=${y1Val.toFixed(2)}, x2=${x2Val.toFixed(2)}, y2=${y2Val.toFixed(2)}, conf=${maxConf.toFixed(4)}`);
    }
  }
  
  const allDetections = [];
  
  for (let i = 0; i < numDetections; i++) {
    let x1, y1, x2, y2, confidence;
    
    if (outputShape[1] === 5 && outputShape[2] === 8400) {
      const x1Idx = i;
      const y1Idx = 8400 + i;
      const x2Idx = 8400 * 2 + i;
      const y2Idx = 8400 * 3 + i;
      const confIdx = 8400 * 4 + i;
      
      const val1 = outputData[x1Idx];
      const val2 = outputData[y1Idx];
      const val3 = outputData[x2Idx];
      const val4 = outputData[y2Idx];
      confidence = outputData[confIdx];
      
      if (val1 < val3 && val2 < val4 && val1 >= 0 && val2 >= 0 && val3 <= MODEL_INPUT_SIZE && val4 <= MODEL_INPUT_SIZE) {
        x1 = val1;
        y1 = val2;
        x2 = val3;
        y2 = val4;
      } else if (val1 < MODEL_INPUT_SIZE && val2 < MODEL_INPUT_SIZE && val3 < MODEL_INPUT_SIZE && val4 < MODEL_INPUT_SIZE) {
        const xCenter = val1;
        const yCenter = val2;
        const width = val3;
        const height = val4;
        x1 = Math.max(0, xCenter - width / 2);
        y1 = Math.max(0, yCenter - height / 2);
        x2 = Math.min(MODEL_INPUT_SIZE, xCenter + width / 2);
        y2 = Math.min(MODEL_INPUT_SIZE, yCenter + height / 2);
      } else {
        x1 = val1;
        y1 = val2;
        x2 = val3;
        y2 = val4;
      }
      
      if (i < 5 && confidence > 0.1) {
        console.log(`Detection ${i}: val1=${val1.toFixed(2)}, val2=${val2.toFixed(2)}, val3=${val3.toFixed(2)}, val4=${val4.toFixed(2)}, conf=${confidence.toFixed(4)}`);
        console.log(`  -> parsed: x1=${x1.toFixed(2)}, y1=${y1.toFixed(2)}, x2=${x2.toFixed(2)}, y2=${y2.toFixed(2)}`);
      }
    } else {
      const baseIdx = i * numValues;
      if (baseIdx + 4 >= outputData.length) break;
      
      if (numValues === 6) {
      x1 = outputData[baseIdx];
      y1 = outputData[baseIdx + 1];
      x2 = outputData[baseIdx + 2];
      y2 = outputData[baseIdx + 3];
      confidence = outputData[baseIdx + 4];
    } else {
      const xCenter = outputData[baseIdx];
      const yCenter = outputData[baseIdx + 1];
      const width = outputData[baseIdx + 2];
      const height = outputData[baseIdx + 3];
      
      confidence = outputData[baseIdx + 4] || 0;
      
      if (numValues > 5) {
        let maxClassConf = 0;
        for (let j = 5; j < numValues && j < baseIdx + numValues; j++) {
          if (outputData[baseIdx + j] > maxClassConf) {
            maxClassConf = outputData[baseIdx + j];
          }
        }
        confidence = confidence * maxClassConf;
      }
      
        x1 = xCenter - width / 2;
        y1 = yCenter - height / 2;
        x2 = xCenter + width / 2;
        y2 = yCenter + height / 2;
      }
    }
    
    if (!isFinite(confidence) || !isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
      if (i < 5) console.log(`Detection ${i} skipped: invalid values`);
      continue;
    }
    
    if (i < 5) {
      console.log(`Detection ${i} raw: x1=${x1.toFixed(2)}, y1=${y1.toFixed(2)}, x2=${x2.toFixed(2)}, y2=${y2.toFixed(2)}, conf=${confidence.toFixed(4)}`);
    }
    
    let x1_model, y1_model, x2_model, y2_model;
    
    if (outputShape[1] === 5 && outputShape[2] === 8400) {
      if (x1 > 1 && y1 > 1 && x2 > 1 && y2 > 1) {
        x1_model = x1;
        y1_model = y1;
        x2_model = x2;
        y2_model = y2;
      } else {
        x1_model = x1 * MODEL_INPUT_SIZE;
        y1_model = y1 * MODEL_INPUT_SIZE;
        x2_model = x2 * MODEL_INPUT_SIZE;
        y2_model = y2 * MODEL_INPUT_SIZE;
      }
    } else {
      x1_model = x1 * MODEL_INPUT_SIZE;
      y1_model = y1 * MODEL_INPUT_SIZE;
      x2_model = x2 * MODEL_INPUT_SIZE;
      y2_model = y2 * MODEL_INPUT_SIZE;
    }
    
    const x1_unpad = (x1_model - offsetX) * scaleX;
    const y1_unpad = (y1_model - offsetY) * scaleY;
    const x2_unpad = (x2_model - offsetX) * scaleX;
    const y2_unpad = (y2_model - offsetY) * scaleY;
    
    const x1_final = Math.max(0, Math.min(originalWidth, x1_unpad));
    const y1_final = Math.max(0, Math.min(originalHeight, y1_unpad));
    const x2_final = Math.max(0, Math.min(originalWidth, x2_unpad));
    const y2_final = Math.max(0, Math.min(originalHeight, y2_unpad));
    
    if (x2_final <= x1_final || y2_final <= y1_final) {
      if (i < 5) console.log(`Detection ${i} skipped: invalid box size`);
      continue;
    }
    
    if (confidence < 0.1) {
      continue;
    }
    
    if (i < 5) {
      console.log(`Detection ${i} valid: final box [${x1_final.toFixed(0)}, ${y1_final.toFixed(0)}, ${x2_final.toFixed(0)}, ${y2_final.toFixed(0)}], conf=${confidence.toFixed(4)}`);
    }
    
    if (x2_final > x1_final && y2_final > y1_final) {
      allDetections.push({
        x1: x1_final,
        y1: y1_final,
        x2: x2_final,
        y2: y2_final,
        score: confidence,
        index: i
      });
    }
  }
  
  allDetections.sort((a, b) => b.score - a.score);
  
  for (const det of allDetections.slice(0, 100)) {
    if (det.score >= 0.1) {
      boxes.push({ x1: det.x1, y1: det.y1, x2: det.x2, y2: det.y2 });
      scores.push(det.score);
    }
  }
  
  console.log(`Found ${boxes.length} valid detections (from ${allDetections.length} total)`);
  return { boxes, scores };
}

async function loadImage(imageSource) {
  if (imageSource instanceof File || imageSource instanceof Blob) {
    const imageUrl = URL.createObjectURL(imageSource);
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(image);
      };
      image.onerror = reject;
      image.src = imageUrl;
    });
    return img;
  } else if (imageSource instanceof HTMLImageElement || imageSource instanceof HTMLVideoElement) {
    const img = new Image();
    img.src = imageSource instanceof HTMLVideoElement 
      ? imageSource.currentSrc || imageSource.src
      : imageSource.src;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    return img;
  } else if (typeof imageSource === 'string') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSource;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    return img;
  }
  throw new Error('Unsupported image source type');
}

export async function detectPlate(imageSource, threshold = 0.1) {
  try {
    const session = await loadModel();
    const image = await loadImage(imageSource);
    const { tensor, scaleX, scaleY, offsetX, offsetY } = preprocessImage(image);
    
    const feeds = {};
    const inputName = session.inputNames[0];
    feeds[inputName] = tensor;
    
    const results = await session.run(feeds);
    const outputName = session.outputNames[0];
    const output = results[outputName];
    
    console.log('Model output shape:', output.dims);
    console.log('Model output names:', session.outputNames);
    console.log('Model input names:', session.inputNames);
    
    const { boxes, scores } = parseYOLOOutput(
      output,
      scaleX,
      scaleY,
      offsetX,
      offsetY,
      image.width,
      image.height
    );
    
    console.log(`Parsed ${boxes.length} boxes, ${scores.length} scores`);
    
    const nmsResults = applyNMS(boxes, scores, 0.45, threshold);
    
    const plates = nmsResults.map(({ box, score }) => ({
      x1: box.x1,
      y1: box.y1,
      x2: box.x2,
      y2: box.y2,
      width: box.x2 - box.x1,
      height: box.y2 - box.y1,
      score: score
    }));
    
    return plates;
  } catch (error) {
    console.error('Error detecting plate:', error);
    return [];
  }
}

export async function hasPlate(imageSource, threshold = 0.25) {
  const plates = await detectPlate(imageSource, threshold);
  return plates.length > 0;
}

export async function capturePlateImage(source) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (source instanceof HTMLVideoElement) {
      canvas.width = source.videoWidth;
      canvas.height = source.videoHeight;
      ctx.drawImage(source, 0, 0);
    } else if (source instanceof HTMLCanvasElement) {
      canvas.width = source.width;
      canvas.height = source.height;
      ctx.drawImage(source, 0, 0);
    } else {
      resolve(null);
      return;
    }
    
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}
