package com.restohub.config;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Bean
    public OpenAIClient openAIClient() {
        String effectiveKey = (apiKey != null && !apiKey.trim().isEmpty()) ? apiKey.trim() : "dummy-key-for-fallback";
        return OpenAIOkHttpClient.builder()
                .apiKey(effectiveKey)
                .build();
    }
}
