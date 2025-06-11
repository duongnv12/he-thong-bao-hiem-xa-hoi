const PDFDocument = require('pdfkit');
const { getPaymentById } = require('../models/payment');

exports.downloadInvoice = async (req, res) => {
  const paymentId = req.params.id;
  const userId = req.user.id; // Đảm bảo chỉ cho phép tải hóa đơn của chính mình
  const payment = await getPaymentById(paymentId, userId);
  if (!payment) return res.status(404).send('Không tìm thấy thanh toán');

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${paymentId}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('HÓA ĐƠN THANH TOÁN BẢO HIỂM XÃ HỘI', { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Mã hóa đơn: INV${paymentId.toString().padStart(6, '0')}`);
  doc.text(`Ngày lập: ${new Date(payment.payment_date).toLocaleDateString('vi-VN')}`).moveDown();
  doc.font('Helvetica-Bold').text('Thông tin người nộp:', { underline: true });
  doc.font('Helvetica').text(`Họ tên: ${payment.user_name || ''}`);
  doc.text(`Email: ${payment.user_email || ''}`).moveDown();
  doc.font('Helvetica-Bold').text('Chi tiết thanh toán:', { underline: true });
  doc.font('Helvetica').text(`Mã giao dịch: ${payment.transaction_code || 'N/A'}`);
  doc.text(`Số tiền: ${parseFloat(payment.amount).toLocaleString('vi-VN')} VNĐ`);
  doc.text(`Nội dung: ${payment.description || ''}`).moveDown();
  doc.fontSize(10).text('Cảm ơn bạn đã sử dụng dịch vụ!', { align: 'center' });
  doc.end();
};