import { ImpactCertificate } from './types';

class ImpactCertificateService {
  private demoStorage: Record<string, ImpactCertificate> = {};

  private getStorage(): Record<string, ImpactCertificate> {
    const saved = localStorage.getItem('guiso_certificates');
    const demoSaved = localStorage.getItem('guiso_demo_certificates');
    const storage = saved ? JSON.parse(saved) : {};
    const demoStorage = demoSaved ? JSON.parse(demoSaved) : {};
    return { ...storage, ...demoStorage };
  }

  private saveStorage(data: Record<string, ImpactCertificate>) {
    // Separar demo de reales si es necesario, pero por ahora guardamos todo en guiso_certificates para asegurar persistencia
    localStorage.setItem('guiso_certificates', JSON.stringify(data));
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

  public clearDemoCertificates() {
    localStorage.removeItem('GSO_DEMO_CERTIFICATES');
  }

  public getDemoCertificates(): ImpactCertificate[] {
    return Object.values(this.demoStorage);
  }

  public getCertificate(id: string): ImpactCertificate | null {
    const storage = this.getStorage();
    return storage[id] || this.demoStorage[id] || null;
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
