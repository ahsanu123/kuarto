# Introduction 

## Notes 

- : => create symbol (:foo, Symbol("foo"))
- :() => create expression, ex :(a+b)
- what is macro in julia => A macro maps a tuple of arguments to a returned expression, and the resulting expression is compiled directly rather than requiring a runtime eval call
- to run macro (eval it) use @ in front of macro name
- macroexpand() => function to debug what macro expanded look like 

make sense macro example 

```julia
macro assert(ex)
  return :( $ex ? nothing : throw(AssertionError($(string(ex)))) )
end

# in repl
julia> @assert 1 == 1.0
julia> @assert 1 == 0
ERROR: AssertionError: 1 == 0

# actually write 
1 == 1.0 ? nothing : throw(AssertionError("1 == 1.0"))
1 == 0 ? nothing : throw(AssertionError("1 == 0"))



```
