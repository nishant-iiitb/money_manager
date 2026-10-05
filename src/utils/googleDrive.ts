import { FinanceData } from '../types/finance';

const BACKUP_FILE_NAME = 'My_Finance_Manager_Backup.json';
const LEGACY_BACKUP_FILE_NAME = 'FinTrack_Data_Backup.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Find existing My Finance Manager backup file in Google Drive
 */
export async function findBackupFile(accessToken: string): Promise<DriveFileInfo | null> {
  // First search for current file name
  const query = encodeURIComponent(
    `(name = '${BACKUP_FILE_NAME}' or name = '${LEGACY_BACKUP_FILE_NAME}') and trashed = false`
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&spaces=drive&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to query Google Drive: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

/**
 * Upload or update backup file in Google Drive.
 * Synced data includes 100% of raw unaggregated transactions, accounts, P2P lending, commitments, budgets, and goals.
 */
export async function saveToGoogleDrive(
  accessToken: string,
  financeData: FinanceData
): Promise<DriveFileInfo> {
  const existingFile = await findBackupFile(accessToken);
  const jsonContent = JSON.stringify(financeData, null, 2);

  if (existingFile) {
    // Update existing file content
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const updateRes = await fetch(uploadUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: jsonContent,
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update file in Google Drive: ${updateRes.statusText}`);
    }

    const updatedData = await updateRes.json();
    return {
      id: updatedData.id,
      name: BACKUP_FILE_NAME,
      modifiedTime: new Date().toISOString(),
    };
  } else {
    // Create new file using multipart upload
    const metadata = {
      name: BACKUP_FILE_NAME,
      mimeType: 'application/json',
      description: 'My Finance Manager complete private database backup (Raw Transactions & Ledger)',
    };

    const boundary = '-------fintrack_boundary_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonContent +
      closeDelimiter;

    const createUrl =
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create backup file in Google Drive: ${createRes.statusText}`);
    }

    return await createRes.json();
  }
}

/**
 * Download and parse backup data from Google Drive
 */
export async function loadFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<FinanceData> {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download backup file from Google Drive: ${response.statusText}`);
  }

  const rawText = await response.text();
  const parsed = JSON.parse(rawText);

  if (!parsed.accounts || !parsed.creditCards || !parsed.transactions) {
    throw new Error('Google Drive file is not a valid My Finance Manager backup structure.');
  }

  return {
    accounts: parsed.accounts,
    cardPools: parsed.cardPools || [],
    creditCards: parsed.creditCards,
    transactions: parsed.transactions || [],
    commitments: parsed.commitments || [],
    householdBudgets: parsed.householdBudgets || [],
    categories: parsed.categories || [],
    goals: parsed.goals || [],
    investments: parsed.investments || [],
    customAssets: parsed.customAssets || [],
    customLiabilities: parsed.customLiabilities || [],
    personLending: parsed.personLending || [],
    lastUpdated: parsed.lastUpdated || Date.now(),
  };
}
