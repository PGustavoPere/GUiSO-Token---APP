import { ImpactCertificate } from './types';

class ImpactCertificateService {
  private inMemoryStorage: Record<string, ImpactCertificate> = {};

  private getStorage(): Record<string, ImpactCertificate> {
    return this.inMemoryStorage;
  }

  private saveStorage(data: Record<string, ImpactCertificate>) {
    this.inMemoryStorage = data;
  }

  public generateCertificate(
    txHash: string,
    wallet: string,
    title: string,
    impactAmount: number,
    meta?: { demo?: boolean }
  ): ImpactCertificate {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = `PIC-${timestamp}-${random}`;
    
    const baseUrl = window.location.origin || 'https://app.guiso';
    const verificationUrl = `${baseUrl}/impact/${id}`;
    
    const certificate: ImpactCertificate = {
      id,
      txHash,
      wallet,
      title,
      impactAmount,
      createdAt: timestamp,
      verificationUrl,
      meta
    };

    const storage = this.getStorage();
    storage[id] = certificate;
    this.saveStorage(storage);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('certificates_updated'));

    return certificate;
  }

  public clearCertificates() {
    this.inMemoryStorage = {};
    window.dispatchEvent(new CustomEvent('certificates_updated'));
  }

  public getCertificate(id: string): ImpactCertificate | null {
    const storage = this.getStorage();
    return storage[id] || null;
  }

  public getCertificatesByWallet(wallet: string): ImpactCertificate[] {
    const storage = this.getStorage();
    return Object.values(storage)
      .filter(cert => cert.wallet.toLowerCase() === wallet.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  
  public getAllCertificates(): ImpactCertificate[] {
    const storage = this.getStorage();
    return Object.values(storage);
  }
}

export const impactCertificateService = new ImpactCertificateService();
