@set counter=1
@set delay=30
@:begin

@rem @ab -c 1000 -n 1000 http://127.0.0.1:8080/test1
ab -c 10 -n 10 http://127.0.0.1:8080/test1

@rem @echo.
@rem @echo Batch %counter% finished. Pausing for %delay% seconds
@rem @timeout %delay%

@rem @set /a counter=%counter%+1
@rem @if %counter% EQU 100 goto end
@rem @goto begin

@:end
