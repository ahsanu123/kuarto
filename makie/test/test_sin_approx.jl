include("../src/sin_approx.jl")

# using Revise
using GLMakie
using Test
using .ModSinApprox # use dot to indicate its local module

@testset "run sin approx plot" begin 
  ModSinApprox.plotSinApprox()
  ModSinApprox.plotHeatmap()
end 

