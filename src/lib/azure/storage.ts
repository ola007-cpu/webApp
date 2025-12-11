import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "videos";

if (!connectionString) {
    console.warn(
        "Azure Storage connection string not found. Please set AZURE_STORAGE_CONNECTION_STRING."
    );
}

// Singleton pattern
let blobServiceClient: BlobServiceClient | null = null;

export const getBlobServiceClient = () => {
    if (!blobServiceClient) {
        if (!connectionString) throw new Error("Azure Storage connection string missing");
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }
    return blobServiceClient;
}

export const getContainerClient = async () => {
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    // Ensure container exists (private by default)
    await containerClient.createIfNotExists();
    return containerClient;
}

export const generateVideoSasUrl = (blobName: string) => {
    if (!connectionString) throw new Error("Azure Storage connection string missing");

    // Extract account name and key from connection string
    // This is a simplified parser, assuming standard format
    const match = connectionString.match(/AccountName=([^;]+);AccountKey=([^;]+)/);
    if (!match) throw new Error("Invalid connection string format");

    const accountName = match[1];
    const accountKey = match[2];

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasOptions = {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // Read only
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    // Construct the full URL with SAS token
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    return `${blobClient.url}?${sasToken}`;
}
