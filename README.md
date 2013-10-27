	
	     ___         ___           ___           ___                       ___               
	    /  /\       /  /\         /  /\         /__/|        ___          /  /\        ___   
	   /  /::\     /  /::\       /  /::\       |  |:|       /  /\        /  /:/_      /__/|  
	  /  /:/\:\   /  /:/\:\     /  /:/\:\      |  |:|      /  /:/       /  /:/ /\    |  |:|  
	 /  /:/~/:/  /  /:/~/:/    /  /:/  \:\   __|__|:|     /__/::\      /  /:/ /:/    |  |:|  
	/__/:/ /:/  /__/:/ /:/___ /__/:/ \__\:\ /__/::::\____ \__\/\:\__  /__/:/ /:/   __|__|:|  
	\  \:\/:/   \  \:\/:::::/ \  \:\ /  /:/    ~\~~\::::/    \  \:\/\ \  \:\/:/   /__/::::\  
	 \  \::/     \  \::/~~~~   \  \:\  /:/      |~~|:|~~      \__\::/  \  \::/       ~\~~\:\ 
	  \  \:\      \  \:\        \  \:\/:/       |  |:|        /__/:/    \  \:\         \  \:\
	   \  \:\      \  \:\        \  \::/        |  |:|        \__\/      \  \:\         \__\/
	    \__\/       \__\/         \__\/         |__|/                     \__\/               
	
	by Websecurify
	

Proxify is a man-in-the-middle http proxy tool.

# Build Instructions

Follow these steps:

1. Download and install [go](http://golang.org/).
2. Set your go home: `export GOPATH=somefolder`.
3. Install github.com/jessevdk/go-flags with `go get http://github.com/jessevdk/go-flags`.
4. Install github.com/websecurify/go-proxy with `go get http://github.com/websecurify/go-proxy`.
5. Install code.google.com/p/go.net/websocket with `go get http://code.google.com/p/go.net/websocket`.
6. Change into go-proxify project directory.
7. Run `go build`.

# Tool Usage

To get started just see `proxify -h`.
