package com.codegym.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.paypal.api.payments.Amount;
import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payer;
import com.paypal.api.payments.Payment;
import com.paypal.api.payments.PaymentExecution;
import com.paypal.api.payments.RedirectUrls;
import com.paypal.api.payments.Transaction;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;

@Service
@RequiredArgsConstructor
public class PayPalService {

    private final APIContext apiContext;

    @Value("${paypal.exchange-rate:25000}")
    private BigDecimal exchangeRate;

    public String createPayPalOrder(BigDecimal totalAmountVnd, String returnUrl, String cancelUrl) 
            throws PayPalRESTException {
        
        // Quy đổi VND sang USD và làm tròn 2 chữ số thập phân asdasdas
        BigDecimal totalAmountUsd = totalAmountVnd.divide(exchangeRate, 2, RoundingMode.HALF_UP);

        Amount amount = new Amount();
        amount.setCurrency("USD");
        amount.setTotal(String.format(Locale.US, "%.2f", totalAmountUsd));

        Transaction transaction = new Transaction();
        transaction.setDescription("Thanh toan hoa don nha hang SmartCafe");
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(returnUrl);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);

        if (createdPayment.getLinks() != null) {
            for (Links link : createdPayment.getLinks()) {
                if ("approval_url".equalsIgnoreCase(link.getRel())) {
                    return link.getHref();
                }
            }
        }

        throw new PayPalRESTException("Không tìm thấy đường dẫn thanh toán (approval_url) từ PayPal.");
    }

    public boolean executePayment(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);

        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);

        Payment executedPayment = payment.execute(apiContext, paymentExecution);
        return "approved".equalsIgnoreCase(executedPayment.getState());
    }
}