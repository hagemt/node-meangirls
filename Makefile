all: dev
.PHONY: all

clean:
	@git clean -dix
.PHONY: clean

dev: node_modules
	yarn dev
.PHONY: dev

install:
	@yarn install --ignore-platform
.PHONY: install

node_modules: yarn.lock
	make install

sane:
	[ -x '$(shell command -v yarn)' ] # on macOS: brew install yarn
	[ -x '$(shell command -v watch)' ] # similar: brew install watch
.PHONY: sane

test: node_modules
	yarn test
.PHONY: test
