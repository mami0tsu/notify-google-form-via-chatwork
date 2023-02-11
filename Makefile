PHONY: clean help init
init: ## init
	brew install volta
	volta setup
	npm install -g @google/clasp
	clasp login

clean: ## clean
	clasp logout
	npm uninstall -g @google/clasp

fmt: ## format with prettier
	npx prettier --write .

v%: ## push git tag
	git tag v$*
	git push origin v$*

help: ## this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
