package com.cybershield.one;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.view.Window;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    return handleIntercept(request.getUrl().toString(), request.getUrl().getPath());
                }
                return null;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                if (url != null) {
                    try {
                        URI uri = new URI(url);
                        return handleIntercept(url, uri.getPath());
                    } catch (Exception e) {
                        return handleIntercept(url, null);
                    }
                }
                return null;
            }
        });

        // Use localhost origin: exempt from DNS resolution, treated as Secure Context by Chromium
        webView.loadUrl("http://localhost/index.html");
    }

    private WebResourceResponse handleIntercept(String url, String path) {
        if (path == null || path.isEmpty() || path.equals("/")) {
            path = "index.html";
        }
        while (path.startsWith("/")) {
            path = path.substring(1);
        }

        // Intercept API calls so they never try network and fail with DNS errors
        if (path.startsWith("api/") || path.equals("api") || url.contains("/api/")) {
            Map<String, String> headers = new HashMap<>();
            headers.put("Access-Control-Allow-Origin", "*");
            headers.put("Content-Type", "application/json");
            return new WebResourceResponse("application/json", "UTF-8", 404, "Not Found", headers,
                new ByteArrayInputStream("{\"error\": \"offline_mode\"}".getBytes()));
        }

        // Search in both dist/ and root asset candidates
        String[] candidates = new String[] {
            "dist/" + path,
            path,
            "dist\\" + path.replace('/', '\\'),
            path.replace('/', '\\')
        };

        for (String candidate : candidates) {
            try {
                InputStream stream = getAssets().open(candidate);
                String mime = getMimeType(candidate);
                WebResourceResponse response = new WebResourceResponse(mime, "UTF-8", stream);
                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", "*");
                response.setResponseHeaders(headers);
                return response;
            } catch (Exception ignored) {}
        }

        // SPA Route fallback: return index.html if route doesn't have a file extension
        if (!path.contains(".")) {
            String[] indexCandidates = new String[] {
                "dist/index.html",
                "index.html",
                "dist\\index.html"
            };
            for (String idxCandidate : indexCandidates) {
                try {
                    InputStream stream = getAssets().open(idxCandidate);
                    WebResourceResponse response = new WebResourceResponse("text/html", "UTF-8", stream);
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Access-Control-Allow-Origin", "*");
                    response.setResponseHeaders(headers);
                    return response;
                } catch (Exception ignored) {}
            }
        }

        return null;
    }

    private String getMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".js")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
