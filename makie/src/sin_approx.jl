module ModSinApprox

using GLMakie;
GLMakie.activate!()

export plotSinApprox

function plotSinApprox()
  x = -2pi:0.1:2pi
  approx = fill(0.0, length(x))
  cmap = [:gold, :deepskyblue3, :orangered, "#e82051"]

  fig, axis, lineplot = lines(x, sin.(x); label = L"sin(x)", linewidth = 3, color = :black,
      axis = (; title = "Polynomial approximation of sin(x)",
          xgridstyle = :dash, ygridstyle = :dash,
          xticksize = 10, yticksize = 10, xtickalign = 1, ytickalign = 1,
          xticks = (-π:π/2:π, ["π", "-π/2", "0", "π/2", "π"])
      ))
  translate!(lineplot, 0, 0, 2) # move line to foreground
  band!(x, sin.(x), approx .+= x; label = L"n = 0")
  band!(x, sin.(x), approx .+= -x .^ 3 / 6; label = L"n = 1")
  band!(x, sin.(x), approx .+= x .^ 5 / 120; label = L"n = 2")
  band!(x, sin.(x), approx .+= -x .^ 7 / 5040; label = L"n = 3")
  limits!(-3.8, 3.8, -1.5, 1.5)
  axislegend(; position = :ct, backgroundcolor = (:white, 0.75), framecolor = :orange)
  save("./approxsin.png", fig, size = (800, 600))

  display(fig)
end
  
end

