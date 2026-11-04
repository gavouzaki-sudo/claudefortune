import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Unhandled React Component Error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="panel gate shrine-loading-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <span className="shrine-loader-emblem" aria-hidden="true" style={{ fontSize: '3.5rem' }}>
            ⛩️
          </span>
          <h2 style={{ color: 'var(--gold, #d4af37)', marginTop: '1rem', fontSize: '1.4rem' }}>
            เกิดข้อผิดพลาดในการประมวลผลระบบ
          </h2>
          <p style={{ color: 'var(--panel-line, rgba(255,255,255,0.7))', marginTop: '0.5rem' }}>
            {this.props.fallbackMessage ||
              'ระบบพบข้อผิดพลาดชั่วคราว ข้อมูลในส่วนนี้ได้ถูกป้องกันไม่ให้กระทบต่อส่วนอื่น'}
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button type="button" className="btn primary" onClick={this.handleReset}>
              🔄 รีโหลดส่วนนี้อีกครั้ง
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => window.location.reload()}
            >
              🏠 กลับสู่หน้าหลัก
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
