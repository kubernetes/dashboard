include $(PARTIALS_DIRECTORY)/config.mk

.PHONY: --ensure-tools
--ensure-tools:
	@$(MAKE) --no-print-directory -C $(TOOLS_DIRECTORY) install
