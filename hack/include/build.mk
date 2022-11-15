# BUILDARCH is the host machine architecture
BUILDARCH ?= $(shell uname -m)

# BUILDOS is the host machine OS
BUILDOS ?= $(shell uname -s)

ifeq ($(BUILDARCH),x86_64)
	BUILDARCH=amd64
endif
ifeq ($(BUILDARCH),arch64)
	BUILDARCH=arm64
endif
ifeq ($(BUILDARCH),armv7l)
	BUILDARCH=armv7
endif

ifeq ($(BUILDOS),Linux)
	BUILDOS=linux
endif
ifeq ($(BUILDOS),Darwin)
	BUILDOS=darwin
endif

# ARCH is the target build architecture. Unless overridden during build, host architecture (BUILDARCH) will be used
ARCH ?= $(BUILDARCH)
# OS is the target build OS. Unless overridden during build, host OS (BUILDOS) will be used
OS ?= $(BUILDOS)
