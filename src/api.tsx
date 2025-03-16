import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

import {
  UserProfile,
  DataCategory,
  DataEntry,
  DataType,
  FormDataType as FormData,
} from "./types"; // ✅ Import interfaces

// Initialize the Amplify client
const client = generateClient<Schema>();

/**
 * Fetch user profiles from the database.
 * @returns {Promise<UserProfile[]>} List of user profiles.
 */
export async function fetchUserProfiles(): Promise<
  Schema["UserProfile"]["type"][]
> {
  try {
    const { data: profiles, errors } = await client.models.UserProfile.list();
    console.log("Profiles: ", profiles, " Errors: ", errors);
    return profiles || [];
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }
}

// Function to fetch all existing DataTypes
export async function fetchDataTypes(): Promise<Schema["DataType"]["type"][]> {
  try {
    const { data: dataTypes, errors } = await client.models.DataType.list();
    console.log("Data Types:", dataTypes, " Errors: ", errors);
    return dataTypes || [];
  } catch (error) {
    console.error("Error fetching data types:", error);
    return [];
  }
}

export async function updateDataType(formData: FormData): Promise<void> {
  try {
    console.log("Updating Type:", formData.name); // Fixed incorrect variable reference

    const { errors } = await client.models.DataType.update({
      id: formData.id!,
      name: formData.name || "", // Ensure a default empty string if missing
      note: formData.note || "", // Default empty string
      inputType: formData.inputType || "",
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating data type:", error);
  }
}

export async function getDataType(
  id: string
): Promise<Schema["DataType"]["type"] | {}> {
  try {
    const { data, errors } = await client.models.DataType.get({ id: id });
    console.log("Data Type:", data, "Errors:", errors);

    if (errors && errors.length > 0) {
      console.error("Errors fetching data type:", errors);
    }

    return data || {};
  } catch (error) {
    console.error("Error fetching data type:", error);
    return {};
  }
}

export async function createUniqueDataType(
  name: string,
  note: string,
  inputType: string,
  isComplex: boolean
) {
  try {
    const { data: dataTypes, errors } = await client.models.DataType.list({
      filter: { name: { eq: name } },
    });

    if (dataTypes.length === 0) {
      await createDataType({
        name: name,
        note: note,
        inputType: inputType,
        isComplex: isComplex,
      });
      console.log(`✅ Created DataType: ${name}.`);
    } else {
      console.log(`DataType "${name}" already exists, skipping.`);
    }
  } catch (error) {
    console.error("Error creating DataType:", error);
  }
}

export async function createDataType(formData: FormData): Promise<void> {
  try {
    console.log("Adding type:", formData.name ?? "Unnamed Type"); // Avoid undefined

    const { errors } = await client.models.DataType.create({
      name: formData.name ?? "", // Ensure a default empty string
      note: formData.note ?? "", // Default to empty string
      isComplex: formData.isComplex ?? false, // Default to false for boolean
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating type:", error);
    throw error; // Ensure the function consistently returns a Promise<DataType>
  }
}

/**
 * Subscribe to real-time updates for data categories.
 * @param {Function} callback - Function to update state with new data.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDataTypes(
  callback: (items: Schema["DataType"]["type"][]) => void
): () => void {
  const sub = client.models.DataType.observeQuery().subscribe({
    next: (result: { items?: Schema["DataType"]["type"][] }) => {
      console.log("Updating DataTypes:", result.items);
      callback(result.items ?? []); // Ensure an empty array if undefined
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

export async function deleteAllDataTypes() {
  try {
    const { data: dataTypes, errors } = await client.models.DataType.list();

    if (dataTypes.length === 0) {
      console.log("No DataTypes to delete.");
      return;
    }

    await Promise.all(
      dataTypes.map((dataType: Schema["DataType"]["type"]) =>
        deleteDataType(dataType.id)
      )
    );

    console.log("✅ All DataTypes have been deleted.");
  } catch (error) {
    console.error("Error deleting DataTypes:", error);
  }
}

export async function deleteDataType(id: string) {
  try {
    await client.models.DataType.delete({ id: id });

    console.log(`Data type deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting DataTypes:", error);
  }
}
export async function deleteDataCategory(id: string) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this Data Category? It will delete all associated entries."
  );
  if (!isConfirmed) {
    console.log("Deletion cancelled by user.");
    return;
  }

  try {
    // Get the IDs of the associated DataEntries
    const { data: categoryWithEntries } = await client.models.DataCategory.get(
      { id: id },
      { selectionSet: ["id", "dataEntries.*"] }
    );

    // Check if categoryWithEntries is null
    if (!categoryWithEntries) {
      console.error(`Data Category with id ${id} not found.`);
      return;
    }

    // Delete all associated DataEntries in parallel
    await Promise.all(
      categoryWithEntries.dataEntries.map((entry) =>
        client.models.DataEntry.delete({ id: entry.id })
      )
    );

    // Delete the DataCategory
    await client.models.DataCategory.delete({ id: categoryWithEntries.id });

    console.log(`Data Category and associated entries deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting DataCategory and associated entries:", error);
  }
}

// Function to fetch all existing DataTypes
export async function fetchDataEntriesByCategory(
  categoryId: string
): Promise<Schema["DataEntry"]["type"][]> {
  try {
    const { data: dataEntries, errors } =
      await client.models.DataEntry.listCategoryEntries(
        {
          dataCategoryId: categoryId,
        },
        {
          sortDirection: "DESC",
        }
      );
    // await client.models.DataEntry.list({ orderBy: { name: "asc" } });
    console.log("Data Entry:", dataEntries, " Errors: ", errors);
    return dataEntries || [];
  } catch (error) {
    console.error("Error fetching data entries:", error);
    return [];
  }
}

export async function fetchDataEntries(
  limit: number,
  nextToken: string | null = null
): Promise<Schema["DataEntry"]["type"][]> {
  try {
    const { data: dataEntries, errors } =
      await client.models.DataEntry.listByDate(
        { dummy: 0 },
        {
          sortDirection: "DESC",
          limit: limit,
          nextToken: nextToken,
        }
      );
    // await client.models.DataEntry.list({ orderBy: { name: "asc" } });
    console.log("Data Entry:", dataEntries, " Errors: ", errors);
    return dataEntries || [];
  } catch (error) {
    console.error("Error fetching data entries:", error);
    return [];
  }
}

export async function deleteAllDataEntries() {
  try {
    const { data: dataEntries, errors } = await client.models.DataEntry.list();

    if (dataEntries.length === 0) {
      console.log("No Entries to delete.");
      return;
    }

    await Promise.all(
      dataEntries.map((dataEntry: Schema["DataEntry"]["type"]) =>
        deleteDataEntry(dataEntry.id)
      )
    );

    console.log("✅ All DataTypes have been deleted.");
  } catch (error) {
    console.error("Error deleting DataTypes:", error);
  }
}

export async function deleteDataEntry(id: string): Promise<void> {
  try {
    // Fetch the data entry to get the dataCategoryId
    const { data: dataEntry, errors: fetchErrors } =
      await client.models.DataEntry.get({ id });

    if (fetchErrors) {
      console.error("Errors fetching data entry:", fetchErrors);
      return;
    }

    if (!dataEntry) {
      console.error("Data entry not found for ID:", id);
      return;
    }

    // Delete the data entry
    const { errors: deleteErrors } = await client.models.DataEntry.delete({
      id,
    });

    if (deleteErrors) {
      console.error("Errors deleting data entry:", deleteErrors);
      return;
    }

    // Decrement the entry count for the category
    await updateDataCategoryEntryCount(dataEntry.dataCategoryId, -1);

    console.log(`Data entry deleted with id ${id}.`);
  } catch (error) {
    console.error("Error deleting DataEntry:", error);
  }
}

/**
 * Create a new data category.
 * @param {string} name - Name of the category.
 * @returns {Promise<void>}
 */
export async function createDataCategory(formData: FormData): Promise<void> {
  try {
    console.log("Adding category:", formData.name); // Fixed incorrect variable reference

    const { errors } = await client.models.DataCategory.create({
      name: formData.name || "", // Ensure a default empty string if missing
      defaultValue: formData.defaultValue || "", // Default empty string
      note: formData.note || "", // Default empty string
      addDefault: formData.addDefault ?? false, // Default to false for boolean
      dataTypeId: formData.dataTypeId!,
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating data category:", error);
  }
}

export async function updateDataCategory(formData: FormData): Promise<void> {
  try {
    console.log("Updating category:", formData.name); // Fixed incorrect variable reference

    const { errors } = await client.models.DataCategory.update({
      id: formData.id!,
      name: formData.name || "", // Ensure a default empty string if missing
      defaultValue: formData.defaultValue || "", // Default empty string
      note: formData.note || "", // Default empty string
      addDefault: formData.addDefault ?? false, // Default to false for boolean
      dataTypeId: formData.dataTypeId!,
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating data category:", error);
  }
}

export async function updateDataCategoryEntryCount(
  categoryId: string,
  adjustment: number
): Promise<void> {
  try {
    console.log(
      "Updating category entry count for category:",
      categoryId,
      "with adjustment:",
      adjustment
    );

    // Fetch the current entry count for the category
    const { data: categoryData, errors: fetchErrors } =
      await client.models.DataCategory.get({ id: categoryId });

    if (fetchErrors) {
      console.error("Errors fetching category data:", fetchErrors);
      return;
    }

    if (!categoryData) {
      console.error("Category not found for ID:", categoryId);
      return;
    }

    // Adjust the entry count
    const updatedEntryCount = (categoryData.entryCount || 0) + adjustment;

    // Update the category with the new entry count
    const { errors: updateErrors } = await client.models.DataCategory.update({
      id: categoryId,
      entryCount: updatedEntryCount,
    });

    if (updateErrors) {
      console.error("Errors updating category entry count:", updateErrors);
    } else {
      console.log(
        "Successfully updated category entry count to:",
        updatedEntryCount
      );
    }
  } catch (error) {
    console.error("Error updating data category:", error);
  }
}

/**
 * Create a new data entry.
 * @param {string} name - Name of the entry.
 * @returns {Promise<void>}
 */
export async function createDataEntry(formData: FormData): Promise<void> {
  try {
    console.log("Adding Entry:", formData.date); // Fixed incorrect variable reference

    const { errors } = await client.models.DataEntry.create({
      date: formData.date!, // Ensure a default empty string if missing
      note: formData.note || "", // Default empty string
      value: formData.value!,
      dataCategoryId: formData.dataCategoryId!,
    });

    console.log("Errors:", errors);

    updateDataCategoryEntryCount(formData.dataCategoryId!, 1);
  } catch (error) {
    console.error("Error creating data Entry:", error);
  }
}

export async function updateDataEntry(formData: FormData): Promise<void> {
  try {
    console.log("Updating Entry:", formData.date); // Fixed incorrect variable reference

    const { errors } = await client.models.DataEntry.update({
      id: formData.id!,
      date: formData.date!, // Ensure a default empty string if missing
      note: formData.note || "", // Default empty string
      value: formData.value!,
      dataCategoryId: formData.dataCategoryId!,
    });
    console.log("Errors:", errors);
  } catch (error) {
    console.error("Error creating data entry:", error);
  }
}

type ResolvedDataType = Omit<Schema["DataType"]["type"], "dataCategories"> & {
  dataCategories?: Schema["DataCategory"]["type"][];
};

type EnrichedDataCategory = Omit<Schema["DataCategory"]["type"], "dataType"> & {
  dataType?: ResolvedDataType;
};

/**
 * Subscribe to real-time updates for data categories, including their data types.
 * @param {Function} callback - Function to update state with new data.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDataCategories(
  callback: (items: Schema["DataCategory"]["type"][]) => void
): () => void {
  const sub = client.models.DataCategory.observeQuery().subscribe({
    next: async (result: { items?: Schema["DataCategory"]["type"][] }) => {
      console.log("Updating DataCategories:", result.items);

      if (!result.items) {
        callback([]);
        return;
      }

      const enrichedItems = await Promise.all(
        result.items.map(async (item) => {
          try {
            let dataType: Schema["DataType"]["type"] | undefined;

            if (item.dataType && typeof item.dataType === "function") {
              // Resolve LazyLoader
              const resolved = await item.dataType();
              dataType = resolved?.data ?? undefined;
            }
            // else if (item.dataTypeId) {
            //   // Fallback if LazyLoader isn't present
            //   dataType = await getDataType(item.dataTypeId);
            // }

            return { ...item, dataType };
          } catch (error) {
            console.error(
              `Failed to fetch DataType for ID ${item.dataTypeId}:`,
              error
            );
            return { ...item };
          }
        })
      );

      console.log("Enriched Categories:", enrichedItems);

      callback(enrichedItems);
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

export function subscribeToDataEntries(
  callback: (items: Schema["DataEntry"]["type"][]) => void
): () => void {
  const sub = client.models.DataEntry.observeQuery().subscribe({
    next: (result: { items?: Schema["DataEntry"]["type"][] }) => {
      console.log("Updating DataEntries:", result.items);
      callback(result.items || []);
    },
    error: (error: unknown) => {
      console.error("Subscription error:", error);
    },
  });

  return () => sub.unsubscribe(); // Cleanup function
}

// Export the client instance if needed elsewhere
export { client };
