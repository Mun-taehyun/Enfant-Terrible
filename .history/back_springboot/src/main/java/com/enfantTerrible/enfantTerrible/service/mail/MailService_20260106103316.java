package com.enfantTerrible.enfantTerrible.service.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

  private final JavaMailSender mailSender;

  /**
   * 회원가입 이메일 인증 메일 발송
   */
  public void sendSignupVerification(String toEmail, String code) {

    try {
      MimeMessage message = mailSender.createMimeMessage();

      MimeMessageHelper helper =
        new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(toEmail);
      helper.setSubject("[EnfantTerrible] 이메일 인증 안내");

      String html = buildSignupVerificationHtml(code);
      helper.setText(html, true); // true = HTML

      mailSender.send(message);

    } catch (MessagingException e) {
      throw new IllegalStateException("이메일 전송에 실패했습니다.", e);
    }
  }

  /**
   * 회원가입 인증 메일 HTML
   */
  private String buildSignupVerificationHtml(String code) {

    return """
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>이메일 인증 안내</h2>
        <p>아래 인증 코드를 회원가입 화면에 입력해 주세요.</p>

        <div style="
          margin: 24px 0;
          padding: 16px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          background-color: #f4f4f4;
          border-radius: 8px;
          letter-spacing: 4px;
        ">
          %s
        </div>

        <p style="color: #555;">
          인증 코드는 <b>10분간</b> 유효합니다.<br/>
        </p>

        <hr/>
        <p style="font-size: 12px; color: #999;">
          © EnfantTerrible
        </p>
      </div>
      """.formatted(code);
  }
}
