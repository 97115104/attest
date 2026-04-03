# attest API Reference

Complete API documentation for programmatic access to attest services.

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Create Attestation](#create-attestation)
  - [Shorten URL](#shorten-url)
  - [Verify Attestation](#verify-attestation)
  - [Get AI Models](#get-ai-models)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Code Examples](#code-examples)

## Authentication

Most endpoints are publicly accessible. Premium features require an API key:

```bash
# Premium endpoints require API key
curl -X POST https://attest.97115104.com/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "ak_your_api_key", ...}'
```

## Endpoints

### Create Attestation

Create a new AI attestation for your content.

**Endpoint:** `GET /api/create.html`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content_name` | string | Yes | Human-readable name for the content |
| `content` | string | No | The actual content (will be hashed) |
| `content_hash` | string | No | Pre-computed SHA-256 hash (format: `sha256:...`) |
| `model` | string | No | AI model ID (default: `gpt-4`) |
| `role` | string | No | AI role: `generated`, `assisted`, or `edited` (default: `assisted`) |
| `document_type` | string | No | Content type (default: `text`) |
| `author` | string | No | Human author name |
| `prompt` | string | No | The prompt used |
| `prompt_private` | boolean | No | If true, only prompt hash is stored |
| `output` | string | No | Response format: `json` or `curl` (default: `json`) |

**Example Request:**
```bash
curl -s "https://attest.97115104.com/api/create.html?content_name=My%20Article&model=claude-3-opus&role=assisted&output=json"
```

**Example Response (JSON):**
```json
{
  "version": "2.0",
  "id": "2025-08-05-abc123",
  "content_name": "My Article",
  "model": "claude-3-opus",
  "role": "assisted",
  "timestamp": "2025-08-05T10:30:00Z",
  "platform": "attest.97115104.com",
  "dataUrl": "data:application/json;base64,eyJ2ZXJzaW9uIjoiMi4wIi...",
  "verifyUrl": "https://attest.97115104.com/verify/?data=eyJ2ZXJzaW9uIjoiMi4wIi...",
  "badgeUrl": "https://attest.97115104.com/assets/badges/claude-assisted.svg"
}
```

**Example Response (curl format):**
```bash
# Badge HTML
<a href="https://attest.97115104.com/verify/?data=..." target="_blank">
  <img src="https://attest.97115104.com/assets/badges/claude-assisted.svg" alt="AI Assisted">
</a>

# Markdown
[![AI Assisted](https://attest.97115104.com/assets/badges/claude-assisted.svg)](https://attest.97115104.com/verify/?data=...)
```

### Shorten URL

Create a permanent short URL for an attestation (Premium feature).

**Endpoint:** `POST /api/shorten`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "dataUrl": "data:application/json;base64,...",
  "url": "https://attest.97115104.com/verify/?data=...",
  "apiKey": "ak_your_api_key",
  "email": "user@example.com"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataUrl` or `url` | string | Yes | The attestation data URL or verify URL |
| `apiKey` | string | Yes* | API key for permanent URLs |
| `email` | string | Yes* | Email associated with API key |

*Either `apiKey` or `email` is required

**Example Request:**
```bash
curl -X POST https://attest.97115104.com/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "dataUrl": "data:application/json;base64,eyJ2ZXJzaW9uIjoiMi4wIi4uLg==",
    "apiKey": "ak_1234567890abcdef"
  }'
```

**Example Response:**
```json
{
  "shortUrl": "https://attest.97115104.com/s/abc123",
  "shortId": "abc123",
  "expiresAt": null
}
```

### Verify Attestation

Programmatically verify an attestation.

**Endpoint:** `POST /api/verify`

**Request Body:**
```json
{
  "attestation": {
    "version": "2.0",
    "id": "2025-08-05-abc123",
    "content_name": "My Article",
    "content_hash": "sha256:...",
    "signature": {...}
  },
  "content": "Optional: original content for hash verification"
}
```

**Example Response:**
```json
{
  "valid": true,
  "checks": {
    "format": true,
    "version": true,
    "required_fields": true,
    "content_hash": true,
    "signature": true
  },
  "errors": [],
  "warnings": []
}
```

### Get AI Models

Retrieve the list of supported AI models.

**Endpoint:** `GET /api/ai-models`

**Example Request:**
```bash
curl -s https://attest.97115104.com/api/ai-models
```

**Example Response:**
```json
{
  "success": true,
  "models": {
    "openai": {
      "name": "OpenAI",
      "models": [
        {
          "id": "gpt-5",
          "name": "GPT-5 (Coming Soon)",
          "color": "#74aa9c"
        },
        {
          "id": "gpt-4-turbo-2024-04-09",
          "name": "GPT-4 Turbo (Apr 2024)",
          "color": "#74aa9c"
        }
      ]
    },
    "anthropic": {
      "name": "Anthropic",
      "models": [
        {
          "id": "claude-4.1-opus",
          "name": "Claude 4.1 Opus",
          "color": "#d4a373"
        }
      ]
    }
  },
  "lastUpdated": "2025-08-05T10:30:00Z"
}
```

## Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 403 | Forbidden - Payment required or invalid API key |
| 404 | Not Found - Resource doesn't exist |
| 405 | Method Not Allowed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PARAMS` | Missing or invalid parameters |
| `PAYMENT_REQUIRED` | Premium feature requires payment |
| `INVALID_API_KEY` | API key is invalid or expired |
| `RATE_LIMIT` | Rate limit exceeded |
| `INVALID_CONTENT` | Content validation failed |

## Rate Limits

- **Public endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 1000 requests per minute per API key
- **Burst allowance:** 10x rate for 10 seconds

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1628089200
```

## Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function createAttestation(contentName, model = 'gpt-4') {
  const params = new URLSearchParams({
    content_name: contentName,
    model: model,
    role: 'assisted',
    output: 'json'
  });
  
  const response = await axios.get(`https://attest.97115104.com/api/create.html?${params}`);
  return response.data;
}

async function shortenUrl(dataUrl, apiKey) {
  const response = await axios.post('https://attest.97115104.com/api/shorten', {
    dataUrl: dataUrl,
    apiKey: apiKey
  });
  return response.data.shortUrl;
}

// Usage
(async () => {
  const attestation = await createAttestation('My Project', 'claude-3-opus');
  console.log('Verification URL:', attestation.verifyUrl);
  
  if (process.env.ATTEST_INK_API_KEY) {
    const shortUrl = await shortenUrl(attestation.dataUrl, process.env.ATTEST_INK_API_KEY);
    console.log('Short URL:', shortUrl);
  }
})();
```

### Python
```python
import requests
import json
from urllib.parse import urlencode

def create_attestation(content_name, model='gpt-4', role='assisted'):
    """Create an AI attestation"""
    params = {
        'content_name': content_name,
        'model': model,
        'role': role,
        'output': 'json'
    }
    
    response = requests.get(
        'https://attest.97115104.com/api/create.html',
        params=params
    )
    response.raise_for_status()
    return response.json()

def shorten_url(data_url, api_key):
    """Create a short URL for an attestation"""
    response = requests.post(
        'https://attest.97115104.com/api/shorten',
        json={
            'dataUrl': data_url,
            'apiKey': api_key
        }
    )
    response.raise_for_status()
    return response.json()['shortUrl']

# Usage
if __name__ == '__main__':
    # Create attestation
    attestation = create_attestation('My Python Project', 'github-copilot')
    print(f"Verification URL: {attestation['verifyUrl']}")
    
    # Create short URL if API key is available
    import os
    if api_key := os.getenv('ATTEST_INK_API_KEY'):
        short_url = shorten_url(attestation['dataUrl'], api_key)
        print(f"Short URL: {short_url}")
```

### PHP
```php
<?php
function createAttestation($contentName, $model = 'gpt-4', $role = 'assisted') {
    $params = http_build_query([
        'content_name' => $contentName,
        'model' => $model,
        'role' => $role,
        'output' => 'json'
    ]);
    
    $url = "https://attest.97115104.com/api/create.html?{$params}";
    $response = file_get_contents($url);
    return json_decode($response, true);
}

function shortenUrl($dataUrl, $apiKey) {
    $data = json_encode([
        'dataUrl' => $dataUrl,
        'apiKey' => $apiKey
    ]);
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => $data
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents('https://attest.97115104.com/api/shorten', false, $context);
    $result = json_decode($response, true);
    return $result['shortUrl'];
}

// Usage
$attestation = createAttestation('My PHP Project', 'gpt-4');
echo "Verification URL: {$attestation['verifyUrl']}\n";

if ($apiKey = getenv('ATTEST_INK_API_KEY')) {
    $shortUrl = shortenUrl($attestation['dataUrl'], $apiKey);
    echo "Short URL: {$shortUrl}\n";
}
?>
```

### Ruby
```ruby
require 'net/http'
require 'json'
require 'uri'

def create_attestation(content_name, model: 'gpt-4', role: 'assisted')
  uri = URI('https://attest.97115104.com/api/create.html')
  uri.query = URI.encode_www_form(
    content_name: content_name,
    model: model,
    role: role,
    output: 'json'
  )
  
  response = Net::HTTP.get_response(uri)
  JSON.parse(response.body)
end

def shorten_url(data_url, api_key)
  uri = URI('https://attest.97115104.com/api/shorten')
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  
  request = Net::HTTP::Post.new(uri)
  request['Content-Type'] = 'application/json'
  request.body = {
    dataUrl: data_url,
    apiKey: api_key
  }.to_json
  
  response = http.request(request)
  JSON.parse(response.body)['shortUrl']
end

# Usage
attestation = create_attestation('My Ruby Project', model: 'github-copilot')
puts "Verification URL: #{attestation['verifyUrl']}"

if api_key = ENV['ATTEST_INK_API_KEY']
  short_url = shorten_url(attestation['dataUrl'], api_key)
  puts "Short URL: #{short_url}"
end
```

### Go
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "net/url"
    "os"
)

type Attestation struct {
    Version   string `json:"version"`
    ID        string `json:"id"`
    DataURL   string `json:"dataUrl"`
    VerifyURL string `json:"verifyUrl"`
}

type ShortenResponse struct {
    ShortURL string `json:"shortUrl"`
    ShortID  string `json:"shortId"`
}

func createAttestation(contentName, model string) (*Attestation, error) {
    params := url.Values{}
    params.Add("content_name", contentName)
    params.Add("model", model)
    params.Add("role", "assisted")
    params.Add("output", "json")
    
    resp, err := http.Get("https://attest.97115104.com/api/create.html?" + params.Encode())
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var attestation Attestation
    if err := json.NewDecoder(resp.Body).Decode(&attestation); err != nil {
        return nil, err
    }
    
    return &attestation, nil
}

func shortenURL(dataURL, apiKey string) (string, error) {
    payload := map[string]string{
        "dataUrl": dataURL,
        "apiKey":  apiKey,
    }
    
    jsonData, err := json.Marshal(payload)
    if err != nil {
        return "", err
    }
    
    resp, err := http.Post(
        "https://attest.97115104.com/api/shorten",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    
    var result ShortenResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return "", err
    }
    
    return result.ShortURL, nil
}

func main() {
    attestation, err := createAttestation("My Go Project", "github-copilot")
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Verification URL: %s\n", attestation.VerifyURL)
    
    if apiKey := os.Getenv("ATTEST_INK_API_KEY"); apiKey != "" {
        shortURL, err := shortenURL(attestation.DataURL, apiKey)
        if err != nil {
            panic(err)
        }
        fmt.Printf("Short URL: %s\n", shortURL)
    }
}
```

## Webhooks (Coming Soon)

Future support for webhooks to notify your application of events:
- Attestation created
- Attestation verified
- Short URL accessed

## Support

- Documentation: https://attest.97115104.com/docs
- GitHub Issues: https://github.com/97115104/attest/issues
- Email: api@attest.97115104.com

---

Last updated: August 2025