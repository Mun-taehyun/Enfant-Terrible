package com.enfantTerrible.enfantTerrible.service.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Component
public class PortOneClient {

  private final RestClient restClient;

  public PortOneClient(
      @Value("${portone.api-secret:}") String apiSecret
  ) {
    this.restClient = RestClient.builder()
        .baseUrl("https://api.portone.io")
        .defaultHeader(HttpHeaders.AUTHORIZATION, "PortOne " + apiSecret)
        .build();
  }

  public PortOnePaymentResponse getPayment(String paymentId) {
    String encoded = UriUtils.encodePathSegment(paymentId, StandardCharsets.UTF_8);
    ResponseEntity<PortOnePaymentResponse> entity = restClient.get()
        .uri("/payments/{paymentId}", encoded)
        .retrieve()
        .toEntity(PortOnePaymentResponse.class);

    return entity.getBody();
  }

  public PortOneCancelPaymentResponse cancelPayment(String paymentId, Long amount, String reason) {
    String encoded = UriUtils.encodePathSegment(paymentId, StandardCharsets.UTF_8);
    CancelPaymentBody body = new CancelPaymentBody(amount, reason);

    ResponseEntity<PortOneCancelPaymentResponse> entity = restClient.post()
        .uri("/payments/{paymentId}/cancel", encoded)
        .body(body)
        .retrieve()
        .toEntity(PortOneCancelPaymentResponse.class);

    return entity.getBody();
  }

  public record CancelPaymentBody(
      Long amount,
      String reason
  ) {}
}
