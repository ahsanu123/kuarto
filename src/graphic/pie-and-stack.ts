import * as d3 from 'd3';

interface PieStackData extends Object {
  year: number,
  vinyl: number,
  eight_track: number,
  cassette: number,
  cd: number,
  download: number,
  streaming: number,
  other: number,
}

interface FormatedData {
  format: string,
  sales: number
  percent?: number,
  centroid?: [number, number]
}
interface FormatInfo {
  id: string,
  label: string,
  color: string,
}

const margin = { top: 50, right: 0, bottom: 50, left: 120 };
const width = 900;
const height = 350;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;


const formatsInfo: FormatInfo[] = [
  { id: "vinyl", label: "Vinyl", color: "#76B6C2" },
  { id: "eight_track", label: "8-Track", color: "#4CDDF7" },
  { id: "cassette", label: "Cassette", color: "#20B9BC" },
  { id: "cd", label: "CD", color: "#2F8999" },
  { id: "download", label: "Download", color: "#E39F94" },
  { id: "streaming", label: "Streaming", color: "#ED7864" },
  { id: "other", label: "Other", color: "#ABABAB" },
];

function initPlaceholderElement(mainElement: Element) {

  const donutElement = document.createElement("div")
  donutElement.id = "donut"

  const streamGraphElement = document.createElement("div")
  streamGraphElement.id = "streamgraph"

  const barsElement = document.createElement("div")
  barsElement.id = "bars"

  mainElement.appendChild(donutElement)
  mainElement.appendChild(streamGraphElement)
  mainElement.appendChild(barsElement)
}

function makeDonutChart(data: PieStackData[], xscale: d3.ScaleBand<number>, colorScale: d3.ScaleOrdinal<string, string, never>) {

  const svg = d3
    .select("#donut")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewbox", `0 0 ${width} ${height}`)

  const mainDonutGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

  const years = [
    d3.min(data, (data) => data.year)!,
    d3.median(data, (data) => data.year)!,
    d3.max(data, (data) => data.year)!,
  ]

  years.forEach((year) => {
    const donutContainer = mainDonutGroup
      .append("g")
      .attr("transform", `translate(${xscale(year)}, ${innerHeight / 2})`)

    const yearData = data.find((item) => item.year === year)
    if (!yearData) throw new Error(`cant find data from year ${year}`)

    let key: keyof PieStackData;

    const formatedData: FormatedData[] = []
    for (key in yearData) {
      formatedData.push({
        format: key,
        sales: yearData[key] as number
      })
    }

    const pieGenerator = d3.pie<FormatedData>()
      .value((data) => data.sales)

    const annotatedData = pieGenerator(formatedData)
    const arcGenerator = d3
      .arc<d3.PieArcDatum<FormatedData>>()
      .startAngle((data) => data.startAngle)
      .endAngle((data) => data.endAngle)
      .innerRadius(60)
      .outerRadius(100)
      .padAngle(0.02)
      .cornerRadius(3)

    const arcs = donutContainer
      .selectAll(`.arc-${year}`)
      .data(annotatedData)
      .join("g")
      .attr("class", `arc-${year}`)

    arcs
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (data) => colorScale(data.data.format))

    arcs
      .append("text")
      .text((data) => d3.format(".0%")((data.endAngle - data.startAngle) / (2 * Math.PI)))
      .attr("x", (data) =>
        arcGenerator
          .startAngle(data.startAngle)
          .endAngle(data.endAngle)
          .centroid(data)[0]
      )
      .attr("y", (data) =>
        arcGenerator
          .startAngle(data.startAngle)
          .endAngle(data.endAngle)
          .centroid(data)[1]
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#f6fafc")
      .style("font-size", "16px")
      .style("font-weight", 500)
      .attr("fill-opacity", data => (data.endAngle - data.startAngle) / (2 * Math.PI) < 0.05 ? 0 : 1)

    donutContainer
      .append("text")
      .text(year)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "24px")
      .style("font-weight", 500);

  })

}

function makeStreamGraph(data: PieStackData[], xscale: d3.ScaleBand<number>, colorScale: d3.ScaleOrdinal<string, string, never>) {

  const svg = d3
    .select("#streamgraph")
    .attr("viewbox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", height)

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

  const maxYear = d3.max(data, (data) => data.year)!
  const minYear = d3.min(data, (data) => data.year)!
  const tickStep = 5

  const bottomAxis = d3
    .axisBottom(xscale)
    .tickValues(d3.range(minYear, maxYear, tickStep))
    .tickSizeOuter(0)
    .tickSize(innerHeight * 1)

  innerChart
    .append("g")
    .attr("class", "x-axis-streamgraph")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(bottomAxis)

  const stackGenerator = d3.stack<PieStackData>()
    .keys(formatsInfo.map((item) => item.id))
    .order(d3.stackOrderInsideOut)
    .offset(d3.stackOffsetSilhouette)

  const annotatedData = stackGenerator(data)
  console.log("annotatedData", annotatedData)

  const minLowerBoundaries: (number)[] = [];
  const maxUpperBoundaries: (number)[] = [];
  annotatedData.forEach(series => {
    minLowerBoundaries.push(d3.min(series, d => d[0])!);
    maxUpperBoundaries.push(d3.max(series, d => d[1])!);
  });

  const minDomain = d3.min(minLowerBoundaries) ?? 0
  const maxDomain = d3.max(maxUpperBoundaries) ?? 0

  const yScale = d3
    .scaleLinear([minDomain, maxDomain], [innerHeight, 0])
    .nice()

}

export async function createPieAndStack(selector: string) {

  const mainElement = document.querySelector(selector);
  if (!mainElement) throw new Error(`${selector} is not found!!!`);
  initPlaceholderElement(mainElement);

  const data = await d3.csv("/src/data/pie-and-stack-data.csv", (data): PieStackData => ({
    year: +data.year,
    vinyl: +data.vinyl,
    eight_track: +data.eight_track,
    cassette: +data.cassette,
    cd: +data.cd,
    download: +data.download,
    streaming: +data.streaming,
    other: +data.other
  }))


  const xScale = d3
    .scaleBand<number>()
    .domain(data.map((item) => item.year))
    .range([0, innerWidth]);

  const colorScale = d3
    .scaleOrdinal<string, string>()
    .domain(formatsInfo.map((format) => format.id))
    .range(formatsInfo.map((format) => format.color));

  makeDonutChart(data, xScale, colorScale);
  makeStreamGraph(data, xScale, colorScale)

}

