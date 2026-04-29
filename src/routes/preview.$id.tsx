import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getResume } from "@/server/functions";
import { ResumePreview } from "@/routes/editor.$id";

export const Route = createFileRoute("/preview/$id")({
  head: () => ({
    meta: [
      { title: "Resume Preview — OwlCV" },
      { name: "description", content: "View this resume built with OwlCV." },
    ],
  }),
  component: PublicResume,
});

function PublicResume() {
  const { id } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResume() {
      try {
        const resume = await getResume({ data: id });
        if (resume && resume.content) {
          setData(resume.content);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [id]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview-root');
    if (!element) return;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const contentWindow = iframe.contentWindow;
      if (!contentWindow) throw new Error('Iframe failed to load');

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML).join('\n');

      contentWindow.document.open();
      contentWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume</title>
            ${styles}
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .resume-preview-container { box-shadow: none !important; border: none !important; }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `);
      contentWindow.document.close();

      await new Promise(resolve => setTimeout(resolve, 300));
      contentWindow.focus();
      contentWindow.print();
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (err) {
      console.error('Print failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-2/40">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Resume not found</h1>
          <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2/40">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            ← Back to Dashboard
          </Link>
          <button onClick={handleDownloadPDF} className="btn-primary px-4 py-2 text-sm shadow-glow"><Download className="h-4 w-4 mr-2 inline" /> Download PDF</button>
        </div>
      </header>

      <div className="p-6 md:p-10 flex justify-center pb-24">
         <div className="shadow-2xl ring-1 ring-border bg-white overflow-hidden origin-top" id="resume-preview-root">
           <ResumePreview data={data} />
         </div>
      </div>
    </div>
  );
}
