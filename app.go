package main

// ---

import (
	"net/http"
)

// ---

func MakeApp() (*http.ServeMux) {
	serveMux := http.NewServeMux()
	
	serveMux.Handle("/", http.FileServer(http.Dir("./app")))
	
	return serveMux
}
