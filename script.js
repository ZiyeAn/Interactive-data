//API url
const API_URL = "https://data.cambridgema.gov/resource/9q33-qjp4.json";

//chart size
const width = 800;
const height = 400;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };

//SVG container
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//x-axis
const xAxisGroup = svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .attr("class", "x-axis");

//y-axis
const yAxisGroup = svg.append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .attr("class", "y-axis");

// Fetch data
const getData = async () => {
  const data = await d3.json(API_URL);
  console.log(data);
  return data;
};

getData().then(data => {
  const statusFilter = document.getElementById("status");

  //chart change while options changes
  const updateChart = () => {
    const selectedStatus = statusFilter.value;
    const filteredData = data.filter(d => d.status === selectedStatus);

    console.log(filteredData)
    // Initialize counts
    let takeOutCount = 0;
    let indoorDiningCount = 0;
    let deliveryCount = 0;
    let outdoorDiningCount = 0;

    // Count dining options
    filteredData.forEach(shop => {
      if (shop.dining_options && shop.dining_options.includes("Take Out")) {
        takeOutCount += 1;
      }
      if (shop.dining_options && shop.dining_options.includes("Indoor Dining")) {
        indoorDiningCount += 1;
      }
      if (shop.dining_options && shop.dining_options.includes("Delivery")) {
        deliveryCount += 1;
      }
      if (shop.dining_options && shop.dining_options.includes("Outdoor Dining")) {
        outdoorDiningCount += 1;
      }
    });

    console.log("Counts for dining options:", { takeOutCount, indoorDiningCount, deliveryCount, outdoorDiningCount });
    //put datas to objects
    const chartData = [
      { option: "Take Out", count: takeOutCount },
      { option: "Indoor Dining", count: indoorDiningCount },
      { option: "Delivery", count: deliveryCount },
      { option: "Outdoor Dining", count: outdoorDiningCount }
    ];
    
    renderChart(chartData);
  };

  //initial display
  updateChart();

  //update chart when selection changes
  statusFilter.addEventListener("change", updateChart);
});

// Render the chart
function renderChart(data) {
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.option))
      .range([margin.left, width - margin.right])
      .padding(0.1);
  
    //y-axis
    const yScale = d3.scaleLinear()
      .domain([0, 350]) // Fix the domain of the y-axis (you can adjust 10 to any value you want)
      .range([height - margin.bottom, margin.top]);
  
    //x-axis
    svg.select(".x-axis") // Select existing x-axis group
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");
  
    // Update y-axis
    svg.select(".y-axis") // Select existing y-axis group
      .call(d3.axisLeft(yScale));
  
    // Bind data to bars
    const bars = svg.selectAll(".bar")
      .data(data, d => d.option);
  
    // Exit
    bars.exit().remove();
  
    // Enter + Update
    bars.enter().append("rect")
      .attr("class", "bar")
      .merge(bars) // Merge updates
      .attr("x", d => xScale(d.option))
      .attr("width", xScale.bandwidth())
      .transition().duration(500)
      .attr("y", d => yScale(d.count))
      .attr("height", d => yScale(0) - yScale(d.count));
  }