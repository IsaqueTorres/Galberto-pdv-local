export type ProductNotFoundModalProps = {
  open: boolean;
  codigo: string;
  onConfirm: () => void;
};

export type StockAlertModalProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};
