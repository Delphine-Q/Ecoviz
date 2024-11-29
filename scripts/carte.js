
  const tablinks = document.querySelectorAll(".tablink");
  console.log(tablinks)

  tablinks.forEach((tablink) => {
    tablink.addEventListener("click", () => {
        tablinks.forEach((t) => {t.classList.remove("active")})
        tablink.classList.add("active")
      })
  });

//W
const width = 900;
const height = 550;


// The svg
const svg = d3.select("#map")
    .append("svg")
    .attr("width", 900)
    .attr("height", 550)

// Define projection and path
const projection = d3.geoMercator()
  //W
  .scale(130)
  .center([5, 10]) 

  //NA
  // .scale(300)
  // .center([-110, 40]) 

  //SA
  // .scale(350)
  // .center([-70, -35]) 

  //EU
  // .scale(470)
  // .center([10, 50]) 

  //AS
  // .scale(350)
  // .center([110,15]) 

  //AF
  // .scale(350)
  // .center([25, -10]) 
  
  .translate([width / 2, height / 1.5]);

const continentButtons = document.querySelectorAll(".conButton")

continentButtons.forEach((continentButton) => {
  continentButton.addEventListener("click", () => {
      continentButtons.forEach((b) => {b.classList.remove("chosen")})
      continentButton.classList.add("chosen")
      console.log(continentButton.id)
      switch (continentButton.id) {
        case "W" : 
          projection.scale(130).center([5, 10]);
          break;
        case "NA" : 
          projection.scale(130).center([5, 10]);
          break;
      }

  })
});


const path = d3.geoPath().projection(projection);

const graphTitle = document.querySelector("#graph-title");

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"), // World map GeoJSON
    d3.csv("data/annual-co2-emissions-per-country.csv"),
    d3.csv("data/contributions-global-temp-change.csv"),
]).then(([geoData, emissionData, temperatureData]) => {

    
  //infobulle
    const tooltip = svg.append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  //fonctions infobulle
  function mouseover(d) {
    tooltip.style("opacity", 1)
  }
  function mousemove(d) {
    tooltip
      .html(d.Entity + " : " + d.emissions_total)
      .style("top", `${(d.y - (tooltip.clientHeight / 2))}px`)
      .style("left", `${(d.x + 35)}px`)
  }
  function mouseleave(d) {
    tooltip.style("opacity", 0)
  }
  


    //La carte
    const countries = svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "white")
      .attr("stroke", "#333")

    //traitement des donnees CO2
    const emissionsByYear = {};
    emissionData.forEach(row => {
        const year = row.Year;
        if (!emissionsByYear[year]) emissionsByYear[year] = {};
        emissionsByYear[year][row.Code] = row.emissions_total;
    });

    const co2Button = d3.select("#co2")
      .on("click", () => {
        graphTitle.innerHTML = "Evolution des emissions CO2"
        //colorscale
        const colorScale = d3.scaleLog()//d3.scaleSequential(d3.interpolateYlOrRd)
          // .domain(d3.extent(emissionData, (d) => (d.Code == null || d.emissions_total == 0) ? NaN : d.emissions_total));
          .domain([100000,11902503000])
          .range(["blue","red"])

        //legendes
        const color = d3.select("#color");
        color.append("g")
          .attr("class", "legendSequential")
          .attr("transform", "translate(20,20)");
        
        const legendSequential = d3.legendColor()
            .shapeWidth(30)
            .shapeHeight(60)
            .cells([10000,100000,1000000,10000000,100000000,100000000000,10000000000])
            .orient("vertical")
            .scale(colorScale) 
            .title("Légende")
            .labelFormat(d3.format(".1s"))
            // .labels(d3.legendHelpers.thresholdLabels)
            
        color.select(".legendSequential")
          .call(legendSequential);


        //affichage en fonction de l'annee choisie
        function updateMap(year) {
          d3.select("#currentYear").text(year);
            const data = emissionsByYear[year];
            countries.attr("fill", d => {
                const iso = d.id;
                return data && data[iso] ? colorScale(data[iso]) : "#ccc";
            });
        }

        d3.select("#yearSlider").on("input", function () {
          updateMap(this.value);
          countries
          .on("mouseover", mouseover())
          .on("mousemove", mousemove(emissionsByYear[this.value]))
          .on("mouseleave", mouseleave())
    
        });

        //initialisation en 1900
        updateMap("1900");


        // setInterval(playChart(), 800)
        // function playChart() {
        //   const input = d3.select("#yearSlider input")
        //   d3.select("#yearSlider").on("input", function () {
        //     while (this.value < input.max) {
        //       updateMap(this.value);
        //       this.value++;
        //     }
        //     setTimeout();
        //   });
        // }


    })

    //traitement des donnees Temperature
    const temperatureByYear = {};
    temperatureData.forEach(row => {
        const year = row.Year;
        if (!temperatureByYear[year]) temperatureByYear[year] = {};
        temperatureByYear[year][row.Code] = row.share_of_temperature_response_ghg_total;
    });

    const temperatureButton = d3.select("#temperature")
      .on("click", () => {
        graphTitle.innerHTML = "Evolution de la contribution au rechauffement climatique"

          //color scale
          const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
          .domain([0,1]);

          //legendes
          const color = d3.select("#color");
        
          color.append("g")
            .attr("class", "legendSequential")
            .attr("transform", "translate(20,20)");
          
          const legendSequential = d3.legendColor()
              .shapeWidth(30)
              .shapeHeight(60)
              .cells([0.1, 0.3, 0.5, 0.7, 0.9])
              .orient("vertical")
              .scale(colorScale) 
              .title("Légende")
              .labelFormat(d3.format(".1p"))
              .labels(d3.legendHelpers.thresholdLabels)
              .labelWrap(30)

          color.select(".legendSequential")
            .call(legendSequential);

          //affichage annee choisie
          function updateMap(year) {
              d3.select("#currentYear").text(year);
              const data = temperatureByYear[year];
              countries.attr("fill", d => {
                  const iso = d.id; // ISO code from GeoJSON
                  return data && data[iso] ? colorScale(data[iso]) : "#ccc";
              });
          }

          d3.select("#yearSlider").on("input", function () {
              updateMap(this.value);
          });

          //initialisation
          updateMap("1900");


        
      })



});

