import { Heading, Divider, Button, Pagination } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataEntry,
  fetchDataEntries,
  deleteAllDataEntries,
  client,
} from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import Form from "../../components/Form/Form";
import styles from "./Entries.module.css";
import { useState, useEffect } from "react";
import { DataEntry } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";

export default function Entries() {
  const { dataCategories, dataTypes, SETTINGS } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);

  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  const fetchEntries = async (token: string | null) => {
    const { data: fetchedEntries, nextToken } =
      await client.models.DataEntry.listByDate(
        { dummy: 0 },
        {
          sortDirection: "DESC",
          limit: 20,
          nextToken: token,
        }
      );
    setDataEntries(fetchedEntries);
    return nextToken;
  };

  const handlePageChange = async (action: "next" | "previous" | number) => {
    let targetPageIndex = currentPageIndex;

    if (action === "next" && hasMorePages) {
      targetPageIndex += 1;
    } else if (action === "previous" && currentPageIndex > 0) {
      targetPageIndex -= 1;
    } else if (typeof action === "number") {
      targetPageIndex = action;
    }

    const token = pageTokens[targetPageIndex];
    const { data: fetchedEntries, nextToken } =
      await client.models.DataEntry.listByDate(
        { dummy: 0 },
        {
          sortDirection: "DESC",
          limit: 20,
          nextToken: token,
        }
      );

    setDataEntries(fetchedEntries);
    setCurrentPageIndex(targetPageIndex);

    // Manage nextToken and hasMorePages
    if (nextToken && !pageTokens.includes(nextToken)) {
      setPageTokens([...pageTokens, nextToken]);
      setHasMorePages(true);
    } else if (!nextToken) {
      setHasMorePages(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const firstNextToken = await fetchEntries(null);
      if (firstNextToken && !pageTokens.includes(firstNextToken)) {
        setPageTokens([...pageTokens, firstNextToken]);
      }
    };
    fetchInitialData();
  }, []);

  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const handleRightClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedEntry((prev) => (prev === id ? null : id));
  };

  const getUpdateEntryFormField = (entry: DataEntry) => [
    { name: "Value", id: "value", default: entry.value ?? "" },
    {
      name: "Data Category",
      id: "dataCategoryId",
      type: "select",
      options: dataCategoryOptions,
      required: true,
      default: entry.dataCategoryId,
    },
    { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
    { name: "Note", id: "note", default: entry.note ?? "" },
    { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
  ];

  const handleFormData = (formData: Record<string, any>) => {
    createDataEntry(formData);
  };

  const handleUpdateEntryFormData = (formData: Record<string, any>) => {
    updateDataEntry(formData);
  };

  const addTestEntries = () => {
    let numberDataTypeId = dataTypes.find((dt) => dt.name === "Number")?.id;
    if (!numberDataTypeId) return;

    const today = new Date();
    dataCategories
      .filter((cat) => cat.dataTypeId === numberDataTypeId)
      .forEach((cat) => {
        for (let x = 1; x < 50; x++) {
          const day = new Date();
          day.setDate(today.getDate() - x);
          createDataEntry({
            dataCategoryId: cat.id,
            value: `${x}`,
            date: day.toISOString().split("T")[0],
            note: "",
          });
        }
      });
  };

  return (
    <>
      <Heading level={1}>Data Entries</Heading>
      <Divider />
      <table>
        <tbody>
          <tr>
            <td>
              <Form
                heading="New Entry"
                fields={getUpdateEntryFormField({} as DataEntry)}
                buttonText="Add New"
                handleFormData={handleFormData}
              />
            </td>
            {SETTINGS.debug && (
              <td>
                <Button onClick={addTestEntries}>Add Test Entries</Button>
              </td>
            )}
            {SETTINGS.debug && (
              <td>
                <Button onClick={deleteAllDataEntries}>
                  Delete All Entries
                </Button>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      <table>
        <tbody>
          {dataEntries.map((item) => (
            <tr
              key={item.id}
              onContextMenu={(e) => handleRightClick(e, item.id)}
            >
              <td className={styles.minWidth}>
                <FlexForm
                  heading="Update Entry"
                  fields={getUpdateEntryFormField(item)}
                  handleFormData={handleUpdateEntryFormData}
                >
                  {item.value}
                  <br />
                  <small>
                    {
                      dataCategories.find((dt) => dt.id === item.dataCategoryId)
                        ?.name
                    }{" "}
                    - {item.date}
                  </small>
                  <br />
                  <small>{item.note}</small>
                </FlexForm>
              </td>
              <td>
                <TextButton onClick={() => deleteDataEntry(item.id)}>
                  <span className={styles.small}>❌</span>
                </TextButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPageIndex + 1}
        totalPages={pageTokens.length}
        onNext={() => handlePageChange("next")}
        onPrevious={() => handlePageChange("previous")}
        onChange={(pageIndex) => {
          if (
            typeof pageIndex === "number" &&
            pageIndex >= 1 &&
            pageIndex <= pageTokens.length
          ) {
            handlePageChange(pageIndex - 1); // Adjust for zero-indexing
          }
        }}
      />
    </>
  );
}
