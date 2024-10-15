package cache

import (
	"io"
	"net/http"

	"k8s.io/dashboard/client/args"
)

type TokenExchangeTransport struct {
	token     string
	transport http.RoundTripper
}

func (in *TokenExchangeTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+in.token)
	return in.transport.RoundTrip(req)
}

func exchangeToken(token string) (string, error) {
	client := &http.Client{Transport: &TokenExchangeTransport{
		token:     token,
		transport: http.DefaultTransport,
	}}

	response, err := client.Get(args.TokenExchangeEndpoint())
	if err != nil {
		return "", err
	}

	defer response.Body.Close()
	contextKey, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	return string(contextKey), nil
}
