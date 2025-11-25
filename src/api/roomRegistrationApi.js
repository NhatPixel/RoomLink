import axiosClient from './axiosClient';

const roomRegistrationApi = {
  // GET - Lấy danh sách đơn đăng ký (có thể filter theo status, page, limit)
  getRoomRegistrations: (params = {}) => {
    return axiosClient.get('/room-registrations', { params });
  },

  // PATCH - Duyệt đơn đăng ký (nhận mảng ids)
  approveRoomRegistration: (ids) => {
    return axiosClient.patch('/room-registrations', { ids });
  },

  // DELETE - Từ chối đơn đăng ký (nhận mảng ids và lý do)
  // reasonsData có thể là:
  // - { type: 'common', reason: '...' } - lý do chung
  // - { type: 'individual', reasons: { [id]: reason } } - lý do riêng
  rejectRoomRegistration: (ids, reasonsData) => {
    let requestData;
    
    if (reasonsData?.type === 'individual') {
      // Gửi object reasons
      requestData = { ids, reasons: reasonsData.reasons };
    } else {
      // Gửi reason string (backward compatible)
      const reason = reasonsData?.reason || (typeof reasonsData === 'string' ? reasonsData : '');
      requestData = { ids, reason };
    }
    
    return axiosClient.delete('/room-registrations/reject', { data: requestData });
  },

  // DELETE - Hủy đăng ký phòng (cho sinh viên)
  // data: { reason: string (optional), checkoutDate: string (required, ISO date) }
  cancelRoomRegistration: (data) => {
    return axiosClient.delete('/room-registrations/cancel', { data });
  },

  // GET - Lấy danh sách đơn hủy phòng (có thể filter theo status, page, limit, keyword)
  getCancelRoomRequests: (params = {}) => {
    return axiosClient.get('/room-registrations/cancel-requests', { params });
  },

  // PATCH - Duyệt đơn hủy phòng (nhận mảng ids)
  approveCancelRoom: (ids) => {
    return axiosClient.patch('/room-registrations/cancel-requests/approve', { ids });
  },

  // PATCH - Từ chối đơn hủy phòng (nhận mảng ids và lý do)
  // reasonsData có thể là:
  // - { type: 'common', reason: '...' } - lý do chung
  // - { type: 'individual', reasons: { [id]: reason } } - lý do riêng
  rejectCancelRoom: (ids, reasonsData) => {
    let requestData;
    
    if (reasonsData?.type === 'individual') {
      // Gửi object reasons
      requestData = { ids, reasons: reasonsData.reasons };
    } else {
      // Gửi reason string (backward compatible)
      const reason = reasonsData?.reason || (typeof reasonsData === 'string' ? reasonsData : '');
      requestData = { ids, reason };
    }
    
    return axiosClient.patch('/room-registrations/cancel-requests/reject', requestData);
  },

  // GET - Lấy danh sách đơn gia hạn phòng (có thể filter theo status, page, limit, keyword)
  getExtendRoomRequests: (params = {}) => {
    return axiosClient.get('/room-registrations/extend-requests', { params });
  },

  // PATCH - Sinh viên yêu cầu gia hạn phòng
  // data: { duration: number } - số tháng gia hạn
  requestRoomExtend: (data) => {
    return axiosClient.patch('/room-registrations/request-extend', data);
  },

  // PATCH - Duyệt đơn gia hạn phòng (nhận mảng ids)
  approveRoomExtend: (ids) => {
    return axiosClient.patch('/room-registrations/approve-extend', { ids });
  },

  // GET - Lấy danh sách đơn chuyển phòng (có thể filter theo status, page, limit, keyword)
  getMoveRoomRequests: (params = {}) => {
    return axiosClient.get('/room-registrations/move-requests', { params });
  },

  // PATCH - Sinh viên yêu cầu chuyển phòng
  // data: { roomSlotId: string (UUID), duration: number } - roomSlotId của slot muốn chuyển đến, duration là thời hạn thuê mới
  requestRoomMove: (data) => {
    return axiosClient.patch('/room-registrations/request-move', data);
  },

  // PATCH - Duyệt đơn chuyển phòng (nhận mảng ids)
  approveRoomMove: (ids) => {
    return axiosClient.patch('/room-registrations/approve-move', { ids });
  },
};

export default roomRegistrationApi;

