import { useState, useEffect, useMemo } from "react";
import { Heading, Divider, Grid, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { fetchDataEntriesByCategory } from "../../api";
import styles from "./DateGraph.module.css";
import { DataPoint, EnrichedDataCategory } from "../../types";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import {
  parseEntryToDisplayValue,
  parseEntryToNumber,
  parseEntryValueToNumber,
} from "../../util";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DateGraph() {
  const { dataCategories, screenWidth, setActiveTab } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [y1MinSetting, setY1MinSetting] = useState<"min-value" | "zeroize">(
    "min-value"
  );
  const [y2MinSetting, setY2MinSetting] = useState<"min-value" | "zeroize">(
    "min-value"
  );
  const [y1BlankHandling, setY1BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");
  const [y2BlankHandling, setY2BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");

  const cat_1_color = "#00bfbf";
  const cat_2_color = "rgb(123, 182, 209)";

  useEffect(() => {
    if (dataCategories && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
      setLoading(false);
    }
  }, [dataCategories]);

  useEffect(() => {
    if (startDate && endDate && selectedCategories.length > 0) {
      updateChartData(selectedCategories);
    }
  }, [
    startDate,
    endDate,
    selectedCategories,
    y2BlankHandling,
    y1BlankHandling,
    y2MinSetting,
    y1MinSetting,
  ]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    categoryIndex: number
  ) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[categoryIndex] = event.target.value;
    setSelectedCategories(newSelectedCategories.filter(Boolean));
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    const newDate = event.target.value;
    if (type === "start") {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
  };

  const handleY1MinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY1MinSetting(event.target.value as "min-value" | "zeroize");
  };

  const handleY2MinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY2MinSetting(event.target.value as "min-value" | "zeroize");
  };

  const handleY1BlankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY1BlankHandling(
      event.target.value as "skip" | "zeroize" | "default" | "previous"
    );
  };

  const handleY2BlankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY2BlankHandling(
      event.target.value as "skip" | "zeroize" | "default" | "previous"
    );
  };

  const updateChartData = async (categories: string[]) => {
    if (!startDate || !endDate || categories.length === 0) return;

    setLoading(true);
    const datasets: any[] = [];
    const allDates = new Set<string>();
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const [index, catId] of categories.entries()) {
      if (!catId) continue;

      const entries = await fetchDataEntriesByCategory(catId);
      const category = dataCategories.find((cat) => cat.id === catId);
      if (!category) continue;

      const dataPoints: DataPoint[] = entries
        .map((entry) => ({
          name: entry.date,
          displayValue: parseEntryToDisplayValue(entry, category),
          value: parseEntryToNumber(entry, category),
          note: entry.note || "",
        }))
        .filter((point) => {
          const pointDate = new Date(point.name);
          return pointDate >= start && pointDate <= end;
        });

      dataPoints.forEach((point) => allDates.add(point.name));

      datasets.push({
        label: category.name,
        dataPoints: dataPoints,
        category, // Store category with dataset
        borderColor: index === 0 ? cat_1_color : cat_2_color,
        backgroundColor:
          index === 0 ? "rgba(0, 191, 191, 0.2)" : "rgba(154, 206, 230, 0.2)",
        tension: 0.1,
        fill: false,
        yAxisID: index === 0 ? "y1" : "y2",
      });
    }

    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const fillAllDates = (sortedDates) => {
      const maxDate = sortedDates[sortedDates.length - 1];
      const minDate = sortedDates[0];
      const allDatesSorted = [minDate];
      let currentDate = new Date(minDate);

      while (currentDate < new Date(maxDate)) {
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        allDatesSorted.push(currentDate.toISOString().split("T")[0]);
      }

      return allDatesSorted;
    };

    const allDatesSorted = fillAllDates(sortedDates);

    const alignedDatasets = datasets.map((dataset, index) => {
      const dataMap = new Map(
        dataset.dataPoints.map((point: DataPoint) => [point.name, point.value])
      );
      const blankHandling = index === 0 ? y1BlankHandling : y2BlankHandling;

      const data = allDatesSorted.map((date) => {
        const value = dataMap.get(date);
        if (value !== undefined) return value;

        switch (blankHandling) {
          case "zeroize":
            return 0;
          case "previous":
            const prevIndex = allDatesSorted.indexOf(date) - 1;
            return prevIndex >= 0 &&
              dataMap.get(allDatesSorted[prevIndex]) !== undefined
              ? dataMap.get(allDatesSorted[prevIndex])
              : 0;
          case "default":
            return parseEntryValueToNumber(
              dataset.category.defaultValue ?? "0", // Use dataset-specific category
              dataset.category
            );
          case "skip":
          default:
            return undefined;
        }
      });

      return {
        label: dataset.label,
        data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        tension: 0.1,
        fill: false,
        yAxisID: dataset.yAxisID,
        spanGaps: true,
      };
    });

    setChartData({
      labels: allDatesSorted,
      datasets: alignedDatasets,
    });
    setLoading(false);
  };

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          callbacks: {
            label: function (context: any) {
              const datasetLabel = context.dataset.label || "";
              const value = context.parsed.y;
              return value !== null && value !== undefined
                ? `${datasetLabel}: ${value}`
                : `${datasetLabel}: No data`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y1: {
          type: "linear" as const,
          position: "left" as const,
          title: {
            display: true,
            text: "Category 1 Value",
            color: cat_1_color,
          },
          grid: {
            drawOnChartArea: false,
          },
          min: y1MinSetting === "zeroize" ? 0 : undefined,
        },
        y2: {
          type: "linear" as const,
          position: "right" as const,
          title: {
            display: true,
            text: "Category 2 Value",
            color: cat_2_color,
          },
          min: y2MinSetting === "zeroize" ? 0 : undefined,
        },
      },
    }),
    [y1MinSetting, y2MinSetting]
  );

  return (
    <>
      <Heading level={1}>Date Graph</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div
          style={{ height: "400px", width: Math.max(screenWidth - 600, 400) }}
        >
          <Line data={chartData} options={options} />
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            {[0, 1].map((index) => (
              <div key={index} className={styles.formGroup}>
                <select
                  onChange={(e) => handleCategoryChange(e, index)}
                  className={styles.multiSelect}
                  value={selectedCategories[index] || ""}
                  style={
                    index == 0
                      ? { color: cat_1_color, fontWeight: "bold" }
                      : { color: cat_2_color, fontWeight: "bold" }
                  }
                >
                  <option value="">Choose Category {index + 1}</option>
                  {dataCategories.map(
                    (item) =>
                      (item.dataType.inputType === "number" ||
                        item.dataType.inputType === "boolean-string" ||
                        item.dataType.inputType === "time" ||
                        item.dataType.id === "select-numeric-001" ||
                        item.dataType.isComplex) && (
                        <option
                          className={styles.tableRow}
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      )
                  )}
                </select>
              </div>
            ))}
          </Grid>
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y1MinSetting}
                onChange={handleY1MinChange}
              >
                <option value="min-value">Min: Auto</option>
                <option value="zeroize">Min: 0</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y2MinSetting}
                onChange={handleY2MinChange}
              >
                <option value="min-value">Min: Auto</option>
                <option value="zeroize">Min: 0</option>
              </select>
            </div>
          </Grid>
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y1BlankHandling}
                onChange={handleY1BlankChange}
              >
                <option value="skip">Blanks: Skip</option>
                <option value="zeroize">Blanks: 0</option>
                <option value="previous">Blanks: Previous</option>
                <option value="default">Blanks: Default</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y2BlankHandling}
                onChange={handleY2BlankChange}
              >
                <option value="skip">Blanks: Skip</option>
                <option value="zeroize">Blanks: 0</option>
                <option value="previous">Blanks: Previous</option>
                <option value="default">Blanks: Default</option>
              </select>
            </div>
          </Grid>
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e, "start")}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(e, "end")}
                className={styles.dateInput}
              />
            </div>
          </Grid>
          <Divider style={{ margin: "10px" }} />
          <Grid
            margin="0 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <Button onClick={() => setActiveTab("graph")}>Legacy Graph</Button>
          </Grid>
          <div style={{ padding: "50px" }}> </div>
        </div>
      )}
    </>
  );
}
