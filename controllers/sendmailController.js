import nodemailer from "nodemailer";

const {EMAIL_USER, EMAIL_PASS} = process.env;
console.log("EMAIL_USER:", EMAIL_USER);
console.log("EMAIL_PASS:", EMAIL_PASS ? "Loaded" : "Not Loaded");

export const sendOrderMail = async (req, res) => {
    const { order_id, user_name, email, recipientName, recipientPhone, total_amount } = req.body;

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER, // 替換為你的 Gmail
          pass: EMAIL_PASS,   // Gmail 應用程式密碼
        },
      });
    
    let mailOptions = {
    from: `"泉發 Chuan Fa" <${EMAIL_USER}>`,
    to: email,
    subject: `🔔【泉發 Chuan Fa】訂單 #${order_id} 成立通知`,
    html: `
        <h2>貴賓 ${user_name}，您的訂單已成立！</h2>
        <p>訂單編號: ${order_id}</p>
        <p>收件人: ${recipientName}</p>
        <p>手機號碼: ${recipientPhone}</p>
        <p>訂單金額: NT$${total_amount}</p>
        <p>
        🚀 提醒您，店內自取時間為 <strong>週四~週日 20:00 ~ 01:00</strong> <br>
        📦 若選擇超商取貨，請留意手機簡訊通知
        </p>
        <p>感謝您的購買！</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "郵件發送成功" });
    } 
    catch (error) {
        console.error("郵件發送失敗", error);
        res.status(500).json({ success: false, message: "郵件發送失敗" });
    }
}