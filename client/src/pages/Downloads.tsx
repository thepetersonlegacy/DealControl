import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, FileText, Lock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DownloadFile {
  key: string;
  name: string;
  format: string;
  size: string;
}

interface DownloadPortalData {
  valid: boolean;
  licenseType: string;
  productTitle: string;
  purchaseDate: string;
  files: DownloadFile[];
  accessLogged: boolean;
}

export default function Downloads() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const { data, isLoading, error } = useQuery<DownloadPortalData>({
    queryKey: ['/api/downloads/portal', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No access token provided');
      }
      const response = await fetch(`/api/downloads/portal?token=${token}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid or expired access token');
      }
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  const downloadMutation = useMutation({
    mutationFn: async (fileKey: string) => {
      const response = await apiRequest('POST', '/api/downloads/log', {
        token,
        fileKey,
        eventType: 'DOWNLOAD',
      });
      return response.json();
    },
  });

  const handleDownload = async (file: DownloadFile) => {
    try {
      await downloadMutation.mutateAsync(file.key);
      window.open(`/api/downloads/file?token=${token}&fileKey=${file.key}`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2" data-testid="text-access-required">Access Required</h2>
            <p className="text-muted-foreground">
              Please use the download link provided in your purchase confirmation email.
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-downloads" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data?.valid) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2" data-testid="text-invalid-token">Invalid Access Token</h2>
            <p className="text-muted-foreground">
              This access link is invalid or has expired. Please contact support if you believe this is an error.
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const licenseLabels: Record<string, string> = {
    solo: 'Solo License',
    pro: 'Pro License',
    office: 'Office License',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-downloads-title">
              Your Files Are Ready
            </h1>
            <p className="text-muted-foreground">
              Download your purchased materials below.
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-product-title">
                  {data.productTitle}
                </h2>
                <p className="text-sm text-muted-foreground">Purchased: {data.purchaseDate}</p>
              </div>
              <Badge variant="secondary" data-testid="badge-license-type">
                {licenseLabels[data.licenseType] || data.licenseType}
              </Badge>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                These materials are licensed for internal use only. All sales are final once accessed.
              </p>
            </div>

            <div className="space-y-3">
              {data.files.map((file) => (
                <div 
                  key={file.key}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{file.format} • {file.size}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(file)}
                    disabled={downloadMutation.isPending}
                    data-testid={`button-download-${file.key}`}
                  >
                    {downloadMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold text-foreground mb-3">License Reminders</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Materials are for internal use within your licensed scope only</li>
              <li>• Do not share, resell, or redistribute these materials</li>
              <li>• Keep copies for your reference — download links may expire</li>
            </ul>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground" data-testid="text-downloads-disclaimer">
              This material is provided for educational and operational support purposes only and does not 
              constitute legal, financial, or tax advice. Users are responsible for compliance with all 
              applicable local, state, and federal laws.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
