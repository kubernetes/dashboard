# Certificate management

This document describes shortly how to get certificates, that can be used to enable HTTPS in Dashboard. There are two steps required to do it:

1. Generate certificates.
    1. [Public trusted CA](#public-trusted-certificate-authority).
    2. [Self-signed certificate](#self-signed-certificate).
2. Pass them to Dashboard.
    1. In case you are following [Recommended Setup](./installation.md#recommended-setup) to deploy Dashboard just generate certificates and follow it.
    2. In any other case you need to alter Dashboard's YAML deploy file and pass --tls-key-file and --tls-cert-file flags to Dashboard. More information about how to mount them into the pods can be found [here](https://kubernetes.io/docs/concepts/storage/volumes/).

## Public trusted Certificate Authority

There are many public and free certificate providers to choose from. One of the best trusted certificate providers is [Let's encrypt](https://letsencrypt.org/). Everything you need to know about how to generate certificates signed by their trusted CA can be found [here](https://letsencrypt.org/getting-started/).

## Self-signed certificate

In case you want to generate certificates on your own you need library like [OpenSSL](https://www.openssl.org/) that will help you do that.

### Generate private key and certificate signing request

A private key and certificate signing request are required to create an SSL certificate. These can be generated with a few simple commands. When the openssl req command asks for a “challenge password”, just press return, leaving the password empty. This password is used by Certificate Authorities to authenticate the certificate owner when they want to revoke their certificate. Since this is a self-signed certificate, there’s no way to revoke it via CRL (Certificate Revocation List).

```shell
openssl genrsa -des3 -passout pass:over4chars -out dashboard.pass.key 2048
...
openssl rsa -passin pass:over4chars -in dashboard.pass.key -out dashboard.key
# Writing RSA key
rm dashboard.pass.key
openssl req -new -key dashboard.key -out dashboard.csr
...
Country Name (2 letter code) [AU]: US
...
A challenge password []:
...
```

### Generate SSL certificate

The self-signed SSL certificate is generated from the `dashboard.key` private key and `dashboard.csr` files.

```shell
openssl x509 -req -sha256 -days 365 -in dashboard.csr -signkey dashboard.key -out dashboard.crt
```

The `dashboard.crt` file is your certificate suitable for use with Dashboard along with the `dashboard.key` private key.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
