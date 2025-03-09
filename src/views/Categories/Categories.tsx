import { useState } from "react";
import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import { createDataCategory, deleteDataCategory } from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import { DataCategory } from "../../types";
import styles from "./Categories.module.css";

export default function Categories() {
  const { dataCategories, dataTypes, dataEntries } = useData();
  const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
    null
  );

  const dataTypeOptions = dataTypes.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    createDataCategory(formData);
  };

  if (selectedCategory) {
    return (
      <CategoryDetail
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <>
      <Heading level={1}>Data Categories</Heading>
      <Divider />
      <Form
        heading="New Category"
        fields={[
          { name: "Name", id: "name", required: true },
          { name: "Note", id: "note" },
          { name: "Add Default", id: "addDefault", type: "checkbox" },
          { name: "Default Value", id: "defaultValue" },
          {
            name: "Data Type",
            id: "dataTypeId",
            type: "select",
            options: dataTypeOptions,
            required: true,
          },
        ]}
        buttonText="Add New"
        handleFormData={handleFormData}
      />

      <table className={styles.table}>
        <tbody>
          {dataCategories.map((item) => (
            <tr className={styles.tableRow} key={item.id}>
              <td>
                <span
                  onClick={() => setSelectedCategory(item)}
                  style={{
                    padding: "2px",
                    cursor: "pointer",
                  }}
                >
                  {item.name}
                </span>
                <br />
                <small>{item.note} </small>
              </td>
              <td>
                <small>
                  {/* Type:{" "} */}
                  {dataTypes.find((dt) => dt.id === item.dataTypeId)?.name ||
                    "Unknown"}
                  {/* <br />
                    {item.addDefault && `Default: ${item.defaultValue}`} */}
                </small>
              </td>
              <td className={styles.paddingLeft}>
                {
                  dataEntries.filter((de) => de.dataCategoryId === item.id)
                    .length
                }
              </td>
              {/* <td>
                <TextButton onClick={() => deleteDataCategory(item.id)}>
                  ❌
                </TextButton>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
