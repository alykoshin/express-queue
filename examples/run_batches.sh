#!/usr/bin/env bash
#@set counter=1
#@set delay=30
#:begin

#ab -c 100 -n 100 http://127.0.0.1:8080/test1
ab -c 10 -n 10 http://127.0.0.1:8080/test1
#ab -c 1 -n 2 http://127.0.0.1:8080/test1
#ab -c 1 -n 1 http://127.0.0.1:8080/test1

#@echo.
#@echo Batch %counter% finished. Pausing for %delay% seconds
#@timeout %delay%
#
#@set /a counter=%counter%+1
#@if %counter% EQU 100 goto end
#@goto begin
#
#:end
