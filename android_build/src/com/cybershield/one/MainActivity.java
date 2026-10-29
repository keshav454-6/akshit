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
                String url = request.getUrl().toString();
                String path = request.getUrl().getPath();
                
                if (path == null || path.isEmpty() || path.equals("/")) {
                    path = "/index.html";
                }
                
                // Strip leading slash for assets loader
                if (path.startsWith("/")) {
                    path = path.substring(1);
                }

                String assetPath = "dist/" + path;

                try {
                    InputStream stream = getAssets().open(assetPath);
                    String mime = "text/html";
                    if (path.endsWith(".js")) mime = "application/javascript";
                    else if (path.endsWith(".css")) mime = "text/css";
                    else if (path.endsWith(".svg")) mime = "image/svg+xml";
                    else if (path.endsWith(".png")) mime = "image/png";
                    else if (path.endsWith(".json")) mime = "application/json";

                    WebResourceResponse response = new WebResourceResponse(mime, "UTF-8", stream);
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Access-Control-Allow-Origin", "*");
                    response.setResponseHeaders(headers);
                    return response;
                } catch (Exception e) {
                    // Fallback to index.html for SPA routes
                    if (!path.contains(".")) {
                        try {
                            InputStream stream = getAssets().open("dist/index.html");
                            WebResourceResponse response = new WebResourceResponse("text/html", "UTF-8", stream);
                            Map<String, String> headers = new HashMap<>();
                            headers.put("Access-Control-Allow-Origin", "*");
                            response.setResponseHeaders(headers);
                            return response;
                        } catch (Exception ex) {
                            return null;
                        }
                    }
                    return null;
                }
            }
        });

        // Use custom local origin to enable ES modules, fetch, and storage safely
        webView.loadUrl("https://cybershield.local/index.html");
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
