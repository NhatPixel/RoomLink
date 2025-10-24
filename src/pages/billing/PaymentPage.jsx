import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import iconVnpay from '../../assets/icon_vnpay.png';
import iconMomo from '../../assets/icon_momo.png';
import iconZalopay from '../../assets/icon_zalopay.png';

const Payment = ({ bill, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Select method, 2: QR Code, 3: Processing, 4: Result
  const [paymentResult, setPaymentResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Mock payment methods
  const paymentMethods = [
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: iconVnpay,
      description: 'Thanh toán qua VNPay',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VNPay-Payment-123456789'
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: iconMomo,
      description: 'Ví điện tử MoMo',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MoMo-Payment-123456789'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: iconZalopay,
      description: 'Ví điện tử ZaloPay',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZaloPay-Payment-123456789'
    },
    {
      id: 'internet_banking',
      name: 'Internet Banking',
      icon: '🏛️',
      description: 'Ngân hàng trực tuyến',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=InternetBanking-Payment-123456789'
    },
    {
      id: 'credit_card',
      name: 'Thẻ tín dụng',
      icon: '💳',
      description: 'Visa, Mastercard',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CreditCard-Payment-123456789'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setErrors({});
  };

  const handleProceedToPayment = () => {
    if (!selectedMethod) {
      setErrors({ method: 'Vui lòng chọn phương thức thanh toán.' });
      return;
    }
    setPaymentStep(2);
    setShowQRCode(true);
  };

  const handlePaymentConfirm = () => {
    setIsProcessing(true);
    setPaymentStep(3);
    
    // Simulate payment processing
    setTimeout(() => {
      // Simulate 80% success rate
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setPaymentResult({
          success: true,
          transactionId: `TXN${Date.now()}`,
          paymentMethod: paymentMethods.find(m => m.id === selectedMethod)?.name,
          amount: bill.amount,
          paidDate: new Date().toISOString().split('T')[0],
          message: 'Thanh toán thành công!'
        });
        
        // Update bill status in localStorage
        updateBillStatus(bill.id, 'paid');
        
        setPaymentStep(4);
      } else {
        setPaymentResult({
          success: false,
          message: 'Hệ thống thanh toán đang gặp sự cố, vui lòng thử lại sau.'
        });
        setPaymentStep(4);
      }
      
      setIsProcessing(false);
    }, 3000);
  };

  const handlePaymentCancel = () => {
    setPaymentResult({
      success: false,
      message: 'Giao dịch đã bị hủy.'
    });
    setPaymentStep(4);
  };

  const updateBillStatus = (billId, status) => {
    // Update bills in localStorage
    const savedBills = localStorage.getItem('studentBills');
    if (savedBills) {
      try {
        const bills = JSON.parse(savedBills);
        const updatedBills = bills.map(b => 
          b.id === billId 
            ? { 
                ...b, 
                status: status, 
                paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
                paymentMethod: status === 'paid' ? paymentMethods.find(m => m.id === selectedMethod)?.name : null
              }
            : b
        );
        localStorage.setItem('studentBills', JSON.stringify(updatedBills));
      } catch (error) {
        console.error('Error updating bills:', error);
      }
    }

    // Update fees in localStorage
    const savedFees = localStorage.getItem('studentFees');
    if (savedFees) {
      try {
        const fees = JSON.parse(savedFees);
        const updatedFees = fees.map(f => 
          f.id === billId 
            ? { 
                ...f, 
                status: status, 
                paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
                paymentMethod: status === 'paid' ? paymentMethods.find(m => m.id === selectedMethod)?.name : null
              }
            : f
        );
        localStorage.setItem('studentFees', JSON.stringify(updatedFees));
      } catch (error) {
        console.error('Error updating fees:', error);
      }
    }
  };

  const handleBack = () => {
    if (paymentStep > 1) {
      setPaymentStep(paymentStep - 1);
      setShowQRCode(false);
      setIsProcessing(false);
    } else {
      onCancel();
    }
  };

  const handleFinish = () => {
    if (paymentResult?.success) {
      onSuccess(paymentResult);
    } else {
      onCancel();
    }
  };

  const getBillTypeIcon = (billType) => {
    if (bill.billType) {
      // For BillsView (electricity/water)
      switch (bill.billType) {
        case 'electricity':
          return '⚡';
        case 'water':
          return '💧';
        default:
          return '📄';
      }
    } else if (bill.feeType) {
      // For FeesView (accommodation/cleaning/etc)
      switch (bill.feeType) {
        case 'accommodation':
          return '🏠';
        case 'cleaning':
          return '🧹';
        case 'security':
          return '🛡️';
        case 'late':
          return '⏰';
        default:
          return '💰';
      }
    }
    return '📄';
  };

  const getBillTypeName = () => {
    if (bill.billTypeName) {
      return bill.billTypeName;
    } else if (bill.feeTypeName) {
      return bill.feeTypeName;
    }
    return 'Hóa đơn';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán hóa đơn</h1>
          <p className="mt-2 text-gray-600">Chọn phương thức thanh toán phù hợp</p>
        </div>

        {/* Bill Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin hóa đơn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getBillTypeIcon()}</span>
              <div>
                <p className="text-sm text-gray-500">Loại hóa đơn</p>
                <p className="font-medium text-gray-900">{getBillTypeName()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mã hóa đơn</p>
              <p className="font-medium text-gray-900">{bill.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phòng</p>
              <p className="font-medium text-gray-900">{bill.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kỳ</p>
              <p className="font-medium text-gray-900">{bill.period}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hạn thanh toán</p>
              <p className="font-medium text-gray-900">{formatDate(bill.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng tiền</p>
              <p className="text-2xl font-bold text-red-600">{formatPrice(bill.amount)}</p>
            </div>
          </div>
        </div>

        {/* Payment Steps */}
        {paymentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Chọn phương thức thanh toán</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {typeof method.icon === 'string' && (method.icon.startsWith('🏛️') || method.icon.startsWith('💳')) ? (
                      <span className="text-2xl mr-3">{method.icon}</span>
                    ) : (
                      <img 
                        src={method.icon} 
                        alt={method.name} 
                        className="w-8 h-8 mr-3 object-contain"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ✓ Đã chọn
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.method && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.method}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                onClick={handleProceedToPayment}
              >
                Tiếp tục thanh toán
              </Button>
            </div>
          </div>
        )}

        {/* QR Code Payment */}
        {paymentStep === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Thanh toán qua {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </h2>
            
            <div className="text-center">
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Số tiền: <span className="text-red-600">{formatPrice(bill.amount)}</span>
                </p>
                <p className="text-gray-600">Quét mã QR để thanh toán</p>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={paymentMethods.find(m => m.id === selectedMethod)?.qrCode} 
                    alt="QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <p className="text-sm text-yellow-800">
                    Vui lòng quét mã QR bằng ứng dụng {paymentMethods.find(m => m.id === selectedMethod)?.name} để hoàn tất thanh toán
                  </p>
                </div>
              </div>
            </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  Quay lại
                </Button>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={handlePaymentCancel}
                >
                  Hủy giao dịch
                </Button>
                <Button
                  variant="success"
                  onClick={handlePaymentConfirm}
                >
                  Đã thanh toán
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {paymentStep === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang xử lý thanh toán...</h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        )}

        {/* Result */}
        {paymentStep === 4 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              {paymentResult?.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-green-600">✓</span>
                  </div>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">Thanh toán thành công!</h2>
                  <p className="text-gray-600 mb-6">{paymentResult.message}</p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Mã giao dịch:</span>
                        <span className="font-medium text-green-800">{paymentResult.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Phương thức:</span>
                        <span className="font-medium text-green-800">{paymentResult.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Số tiền:</span>
                        <span className="font-medium text-green-800">{formatPrice(paymentResult.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Ngày thanh toán:</span>
                        <span className="font-medium text-green-800">{formatDate(paymentResult.paidDate)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-600">✗</span>
                  </div>
                  <h2 className="text-xl font-semibold text-red-800 mb-2">Thanh toán thất bại</h2>
                  <p className="text-gray-600 mb-6">{paymentResult.message}</p>
                </>
              )}
              
              <button
                onClick={handleFinish}
                className={`px-6 py-3 rounded-md text-white transition-colors ${
                  paymentResult?.success 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {paymentResult?.success ? 'Hoàn thành' : 'Thử lại'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
