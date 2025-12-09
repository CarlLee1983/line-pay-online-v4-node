# Error Handling

The SDK throws standard JavaScript `Error` objects when an API call fails or a network issue occurs.

## Error Types

### API Errors
If the LINE Pay API returns a non-200 HTTP status (e.g., 400 Bad Request, 500 Internal Server Error), the client throws an Error with the message:

```
LINE Pay API Error: {HTTP_STATUS} {STATUS_TEXT} - {RESPONSE_BODY}
```

**Example:**
```typescript
try {
  await client.requestPayment(...)
} catch (e) {
  console.log(e.message) 
  // "LINE Pay API Error: 400 Bad Request - {"returnCode":"1106","returnMessage":"Invalid parameter"}"
}
```

> **Note**: If the HTTP status is 200 OK but `returnCode` is not "0000", the Promise **resolves** normally. You must check `response.returnCode` in your application logic.

```typescript
const res = await client.requestPayment(...)
if (res.returnCode !== '0000') {
  // Handle business logic error (e.g., User canceled, Insufficient balance)
  console.error(`Error: ${res.returnCode} - ${res.returnMessage}`)
}
```

### Network Errors
If the request fails due to network issues (dns, connection refused), a standard fetch error is thrown.

### Timeouts
If `timeout` is configured (default 20s) and the request exceeds it, the client throws:
```
Request timeout after {timeout}ms
```

## Common Return Codes

| Code | Message | Description |
|------|---------|-------------|
| 0000 | Success | The request was successful. |
| 1104 | Merchant not found | Check your Channel ID. |
| 1105 | Merchant not allowed | Your IP might not be whitelisted. |
| 1106 | Invalid parameter | Check your request body parameters (e.g. amount mismatch). |
| 1172 | User not found | Sandbox user issue or Channel ID issue. |

Refer to [LINE Pay API Guide](https://pay.line.me/documents/online_v3_en.html) for full list.
