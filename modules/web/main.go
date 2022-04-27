// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"crypto/elliptic"
	"crypto/tls"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/spf13/pflag"

	"k8s.io/dashboard/web/pkg/args"
	"k8s.io/dashboard/web/pkg/cert"
	"k8s.io/dashboard/web/pkg/cert/ecdsa"
	"k8s.io/dashboard/web/pkg/handler"
	"k8s.io/dashboard/web/pkg/systembanner"
)

var (
	argInsecurePort             = pflag.Int("insecure-port", 4000, "port to listen to for incoming HTTP requests")
	argPort                     = pflag.Int("port", 4001, "secure port to listen to for incoming HTTPS requests")
	argInsecureBindAddress      = pflag.IP("insecure-bind-address", net.IPv4(127, 0, 0, 1), "IP address on which to serve the --insecure-port, set to 127.0.0.1 for all interfaces")
	argBindAddress              = pflag.IP("bind-address", net.IPv4(0, 0, 0, 0), "IP address on which to serve the --port, set to 0.0.0.0 for all interfaces")
	argDefaultCertDir           = pflag.String("default-cert-dir", "/certs", "directory path containing files from --tls-cert-file and --tls-key-file, used also when auto-generating certificates flag is set")
	argCertFile                 = pflag.String("tls-cert-file", "", "file containing the default x509 certificate for HTTPS")
	argKeyFile                  = pflag.String("tls-key-file", "", "file containing the default x509 private key matching --tls-cert-file")
	argSystemBanner             = pflag.String("system-banner", "", "system banner message displayed in the app if non-empty, it accepts simple HTML")
	argSystemBannerSeverity     = pflag.String("system-banner-severity", "INFO", "severity of system banner, should be one of 'INFO', 'WARNING' or 'ERROR'")
	argAutoGenerateCertificates = pflag.Bool("auto-generate-certificates", false, "enables automatic certificates generation used to serve HTTPS")
	localeConfig                = pflag.String("locale-config", "./locale_conf.json", "path to file containing the locale configuration")
)

func main() {
	// Set logging output to standard console out
	log.SetOutput(os.Stdout)

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	_ = flag.CommandLine.Parse(make([]string, 0)) // Init for glog calls in kubernetes packages

	// Initializes dashboard arguments holder so we can read them in other packages
	initArgHolder()

	// Init system banner manager
	systemBannerManager := systembanner.NewSystemBannerManager(args.Holder.GetSystemBanner(),
		args.Holder.GetSystemBannerSeverity())

	var servingCerts []tls.Certificate
	if args.Holder.GetAutoGenerateCertificates() {
		log.Println("Auto-generating certificates")
		certCreator := ecdsa.NewECDSACreator(args.Holder.GetKeyFile(), args.Holder.GetCertFile(), elliptic.P256())
		certManager := cert.NewCertManager(certCreator, args.Holder.GetDefaultCertDir())
		servingCert, err := certManager.GetCertificates()
		if err != nil {
			handleFatalInitServingCertError(err)
		}
		servingCerts = []tls.Certificate{servingCert}
	} else if args.Holder.GetCertFile() != "" && args.Holder.GetKeyFile() != "" {
		certFilePath := args.Holder.GetDefaultCertDir() + string(os.PathSeparator) + args.Holder.GetCertFile()
		keyFilePath := args.Holder.GetDefaultCertDir() + string(os.PathSeparator) + args.Holder.GetKeyFile()
		servingCert, err := tls.LoadX509KeyPair(certFilePath, keyFilePath)
		if err != nil {
			handleFatalInitServingCertError(err)
		}
		servingCerts = []tls.Certificate{servingCert}
	}

	// Run a HTTP server that serves static public files from './public' and handles API calls.
	http.Handle("/", handler.MakeGzipHandler(handler.CreateLocaleHandler()))
	http.Handle("/config", handler.AppHandler(handler.ConfigHandler))

	systemBannerHandler := systembanner.NewSystemBannerHandler(systemBannerManager)
	systemBannerHandler.Install()

	// Listen for http or https
	if servingCerts != nil {
		log.Printf("Serving securely on HTTPS port: %d", args.Holder.GetPort())
		secureAddr := fmt.Sprintf("%s:%d", args.Holder.GetBindAddress(), args.Holder.GetPort())
		server := &http.Server{
			Addr:    secureAddr,
			Handler: http.DefaultServeMux,
			TLSConfig: &tls.Config{
				Certificates: servingCerts,
				MinVersion:   tls.VersionTLS12,
			},
		}
		go func() { log.Fatal(server.ListenAndServeTLS("", "")) }()
	} else {
		log.Printf("Serving insecurely on HTTP port: %d", args.Holder.GetInsecurePort())
		addr := fmt.Sprintf("%s:%d", args.Holder.GetInsecureBindAddress(), args.Holder.GetInsecurePort())
		go func() { log.Fatal(http.ListenAndServe(addr, nil)) }()
	}
	select {}
}

func initArgHolder() {
	builder := args.GetHolderBuilder()
	builder.SetInsecurePort(*argInsecurePort)
	builder.SetPort(*argPort)
	builder.SetInsecureBindAddress(*argInsecureBindAddress)
	builder.SetBindAddress(*argBindAddress)
	builder.SetDefaultCertDir(*argDefaultCertDir)
	builder.SetCertFile(*argCertFile)
	builder.SetKeyFile(*argKeyFile)
	builder.SetSystemBanner(*argSystemBanner)
	builder.SetSystemBannerSeverity(*argSystemBannerSeverity)
	builder.SetAutoGenerateCertificates(*argAutoGenerateCertificates)
	builder.SetLocaleConfig(*localeConfig)
}

/**
 * Handles fatal init errors encountered during service cert loading.
 */
func handleFatalInitServingCertError(err error) {
	log.Fatalf("Error while loading dashboard server certificates. Reason: %s", err)
}
