module ModSinApprox

using GLMakie;
GLMakie.activate!()

export plotSinApprox

function plotHeatmap()
x = y = -5:0.5:5
z = x .^ 2 .+ y' .^ 2
cmap = :plasma
with_theme(colormap = cmap) do
    fig = Figure(fontsize = 22)
    ax3d = Axis3(fig[1, 1]; aspect = (1, 1, 1),
        perspectiveness = 0.5, azimuth = 2.19, elevation = 0.57)
    ax2d = Axis(fig[1, 2]; aspect = 1, xlabel = "x", ylabel="y")
    pltobj = surface!(ax3d, x, y, z; transparency = true)
    heatmap!(ax2d, x, y, z; colormap = (cmap, 0.65))
    contour!(ax2d, x, y, z; linewidth = 2, levels = 12, color = :black)
    contour3d!(ax3d, x, y, z; linewidth = 4, levels = 12,
        transparency = true)
    Colorbar(fig[1, 3], pltobj; label="z", labelrotation=pi)
    colsize!(fig.layout, 1, Aspect(1, 1.0))
    colsize!(fig.layout, 2, Aspect(1, 1.0))
    resize_to_layout!(fig)
    save("./assets/simpleLayout.png", fig)
    fig
end

end
