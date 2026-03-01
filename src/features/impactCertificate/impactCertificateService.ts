import { ImpactCertificate } from './types';

class ImpactCertificateService {
  private demoStorage: Record<string, ImpactCertificate> = {};

  private getStorage(): Record<string, ImpactCertificate> {
    const saved = localStorage.getItem('guiso_certificates');
    return saved ? JSON.parse(saved) : {};
  }

  private saveStorage(data: Record<string, ImpactCertificate>) {
    localStorage.setItem('guiso_certificates', JSON.stringify(data));
  }

  private getDemoStorage(): Record<string, ImpactCertificate> {
    return this.demoStorage;
  }

  private saveDemoStorage(data: Record<string, ImpactCertificate>) {
    this.demoStorage = data;
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

    if (meta?.demo) {
      const storage = this.getDemoStorage();
      storage[id] = certificate;
      this.saveDemoStorage(storage);
    } else {
      const storage = this.getStorage();
      storage[id] = certificate;
      this.saveStorage(storage);
    }

    return certificate;
  }

  public clearDemoCertificates() {
    localStorage.removeItem('GSO_DEMO_CERTIFICATES');
  }

  public getDemoCertificates(): ImpactCertificate[] {
    const demoStorage = this.getDemoStorage();
    return Object.values(demoStorage);
  }

  public getCertificate(id: string): ImpactCertificate | null {
    const storage = this.getStorage();
    const demoStorage = this.getDemoStorage();
    return storage[id] || demoStorage[id] || null;
  }

  public getCertificatesByWallet(wallet: string): ImpactCertificate[] {
    const storage = this.getStorage();
    const demoStorage = this.getDemoStorage();
    const allCerts = [...Object.values(storage), ...Object.values(demoStorage)];
    return allCerts
      .filter(cert => cert.wallet.toLowerCase() === wallet.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  
  public getAllCertificates(): ImpactCertificate[] {
    const storage = this.getStorage();
    const demoStorage = this.getDemoStorage();
    return [...Object.values(storage), ...Object.values(demoStorage)];
  }
}

export const impactCertificateService = new ImpactCertificateService();
