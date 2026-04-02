import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  Calculator,
  FilePlus2,
  FileSpreadsheet,
  Landmark,
  PackageCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

type InvoiceType = 'purchase' | 'sale';
type InvoiceStatus = 'draft' | 'issued';

type Invoice = {
  id: string;
  date: string;
  type: InvoiceType;
  partner: string;
  item: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  status: InvoiceStatus;
};

const VAT_OPTIONS = [0, 5, 8, 10];

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'HDN-0001',
    date: '2026-01-05',
    type: 'purchase',
    partner: 'Công ty Bao Bì Sài Gòn',
    item: 'Bao bì PE',
    quantity: 1200,
    unitPrice: 1500,
    vatRate: 8,
    status: 'issued',
  },
  {
    id: 'HDB-0001',
    date: '2026-01-09',
    type: 'sale',
    partner: 'Siêu thị An Phúc',
    item: 'Thực phẩm đóng gói',
    quantity: 420,
    unitPrice: 85000,
    vatRate: 8,
    status: 'issued',
  },
  {
    id: 'HDN-0002',
    date: '2026-02-15',
    type: 'purchase',
    partner: 'Công ty Nông Sản Tây Nguyên',
    item: 'Hạt điều nguyên liệu',
    quantity: 700,
    unitPrice: 62000,
    vatRate: 5,
    status: 'issued',
  },
  {
    id: 'HDB-0002',
    date: '2026-03-20',
    type: 'sale',
    partner: 'Nhà phân phối Bắc Nam',
    item: 'Hạt điều rang muối',
    quantity: 350,
    unitPrice: 126000,
    vatRate: 8,
    status: 'issued',
  },
];

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

function startOfYearISO(date: Date) {
  return `${date.getFullYear()}-01-01`;
}

function startOfMonthISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

function formatDateISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function endOfMonthISO(date: Date) {
  return formatDateISO(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function endOfQuarterISO(date: Date) {
  const quarterEndMonth = Math.floor(date.getMonth() / 3) * 3 + 2;
  return formatDateISO(new Date(date.getFullYear(), quarterEndMonth + 1, 0));
}

function endOfYearISO(date: Date) {
  return `${date.getFullYear()}-12-31`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoice' | 'inventory' | 'tax'>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);

  const [form, setForm] = useState<Omit<Invoice, 'id'>>({
    date: new Date().toISOString().slice(0, 10),
    type: 'sale',
    partner: '',
    item: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 8,
    status: 'issued',
  });

  const today = new Date();
  const todayISO = formatDateISO(today);

  const computedInvoices = useMemo(
    () =>
      invoices
        .map((invoice) => {
          const amount = invoice.quantity * invoice.unitPrice;
          const vat = (amount * invoice.vatRate) / 100;
          return { ...invoice, amount, vat, total: amount + vat };
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [invoices],
  );

  const summary = useMemo(() => {
    const revenue = computedInvoices
      .filter((it) => it.type === 'sale')
      .reduce((sum, it) => sum + it.amount, 0);
    const expense = computedInvoices
      .filter((it) => it.type === 'purchase')
      .reduce((sum, it) => sum + it.amount, 0);
    const vatOutput = computedInvoices
      .filter((it) => it.type === 'sale')
      .reduce((sum, it) => sum + it.vat, 0);
    const vatInput = computedInvoices
      .filter((it) => it.type === 'purchase')
      .reduce((sum, it) => sum + it.vat, 0);

    const profit = revenue - expense;
    const corporateTax = profit > 0 ? profit * 0.2 : 0;

    return {
      revenue,
      expense,
      vatOutput,
      vatInput,
      vatPayable: Math.max(vatOutput - vatInput, 0),
      vatCredit: Math.max(vatInput - vatOutput, 0),
      profit,
      corporateTax,
    };
  }, [computedInvoices]);

  const inventoryRows = useMemo(() => {
    const inventoryMap = new Map<
      string,
      { purchased: number; sold: number; avgBuyPrice: number; totalBuyValue: number }
    >();

    for (const item of computedInvoices) {
      const row = inventoryMap.get(item.item) ?? {
        purchased: 0,
        sold: 0,
        avgBuyPrice: 0,
        totalBuyValue: 0,
      };

      if (item.type === 'purchase') {
        row.purchased += item.quantity;
        row.totalBuyValue += item.amount;
        row.avgBuyPrice = row.purchased > 0 ? row.totalBuyValue / row.purchased : 0;
      } else {
        row.sold += item.quantity;
      }

      inventoryMap.set(item.item, row);
    }

    return Array.from(inventoryMap.entries()).map(([item, row]) => {
      const onHand = row.purchased - row.sold;
      return {
        item,
        purchased: row.purchased,
        sold: row.sold,
        onHand,
        avgBuyPrice: row.avgBuyPrice,
        stockValue: onHand * row.avgBuyPrice,
      };
    });
  }, [computedInvoices]);

  const periodReport = useMemo(() => {
    const getPeriod = (periodType: 'month' | 'quarter' | 'year') => {
      let from = startOfMonthISO(today);
      let endOfPeriod = endOfMonthISO(today);
      if (periodType === 'quarter') {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        from = `${today.getFullYear()}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
        endOfPeriod = endOfQuarterISO(today);
      }
      if (periodType === 'year') {
        from = startOfYearISO(today);
        endOfPeriod = endOfYearISO(today);
      }

      const to = endOfPeriod < todayISO ? endOfPeriod : todayISO;
      const items = computedInvoices.filter((invoice) => invoice.date >= from && invoice.date <= to);
      const sale = items.filter((it) => it.type === 'sale');
      const purchase = items.filter((it) => it.type === 'purchase');

      const revenue = sale.reduce((sum, it) => sum + it.amount, 0);
      const expense = purchase.reduce((sum, it) => sum + it.amount, 0);
      const vatOut = sale.reduce((sum, it) => sum + it.vat, 0);
      const vatIn = purchase.reduce((sum, it) => sum + it.vat, 0);
      const profit = revenue - expense;

      return {
        from,
        to,
        count: items.length,
        revenue,
        expense,
        vatPayable: Math.max(vatOut - vatIn, 0),
        vatCredit: Math.max(vatIn - vatOut, 0),
        corporateTax: profit > 0 ? profit * 0.2 : 0,
      };
    };

    return {
      monthly: getPeriod('month'),
      quarterly: getPeriod('quarter'),
      yearly: getPeriod('year'),
    };
  }, [computedInvoices, today]);

  const addInvoice = () => {
    if (!form.partner || !form.item || form.quantity <= 0 || form.unitPrice <= 0) {
      return;
    }

    const prefix = form.type === 'sale' ? 'HDB' : 'HDN';
    const sameTypeCount = invoices.filter((it) => it.type === form.type).length + 1;
    const id = `${prefix}-${String(sameTypeCount).padStart(4, '0')}`;

    setInvoices((prev) => [{ ...form, id }, ...prev]);
    setForm((prev) => ({ ...prev, partner: '', item: '', quantity: 1, unitPrice: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <Landmark className="text-emerald-600" />
          Phần mềm kế toán thuế doanh nghiệp Việt Nam
        </h1>
        <p className="text-sm text-slate-500 mt-1">Tích hợp hóa đơn với kho và tự động lập báo cáo thuế tháng, quý, năm.</p>
      </header>

      <div className="grid md:grid-cols-[250px_1fr] gap-4 p-4 md:p-6">
        <aside className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 h-fit">
          {[
            { key: 'dashboard', label: 'Tổng quan', icon: <BarChart3 size={18} /> },
            { key: 'invoice', label: 'Hóa đơn', icon: <FileSpreadsheet size={18} /> },
            { key: 'inventory', label: 'Kho hàng', icon: <Boxes size={18} /> },
            { key: 'tax', label: 'Báo cáo thuế', icon: <Calculator size={18} /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as typeof activeTab)}
              className={`w-full text-left p-3 rounded-xl mb-2 flex items-center gap-2 text-sm font-medium transition ${
                activeTab === item.key ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        <main className="space-y-4">
          {activeTab === 'dashboard' && (
            <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
              <Card title="Doanh thu" value={money.format(summary.revenue)} icon={<TrendingUp className="text-emerald-600" />} />
              <Card title="Chi phí" value={money.format(summary.expense)} icon={<TrendingDown className="text-rose-600" />} />
              <Card title="VAT phải nộp" value={money.format(summary.vatPayable)} icon={<PackageCheck className="text-amber-600" />} />
              <Card title="Thuế TNDN ước tính" value={money.format(summary.corporateTax)} icon={<Landmark className="text-indigo-600" />} />
            </section>
          )}

          {activeTab === 'invoice' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FilePlus2 size={20} className="text-emerald-600" />
                Tạo hóa đơn và tự động cập nhật kho
              </h2>

              <div className="grid md:grid-cols-3 gap-3">
                <Input label="Ngày" type="date" value={form.date} onChange={(value) => setForm((p) => ({ ...p, date: value }))} />
                <Select
                  label="Loại hóa đơn"
                  value={form.type}
                  onChange={(value) => setForm((p) => ({ ...p, type: value as InvoiceType }))}
                  options={[
                    { label: 'Hóa đơn bán ra', value: 'sale' },
                    { label: 'Hóa đơn mua vào', value: 'purchase' },
                  ]}
                />
                <Input label="Đối tác" value={form.partner} onChange={(value) => setForm((p) => ({ ...p, partner: value }))} />
                <Input label="Mặt hàng" value={form.item} onChange={(value) => setForm((p) => ({ ...p, item: value }))} />
                <Input
                  label="Số lượng"
                  type="number"
                  value={String(form.quantity)}
                  onChange={(value) => setForm((p) => ({ ...p, quantity: Number(value) }))}
                />
                <Input
                  label="Đơn giá"
                  type="number"
                  value={String(form.unitPrice)}
                  onChange={(value) => setForm((p) => ({ ...p, unitPrice: Number(value) }))}
                />
                <Select
                  label="Thuế suất VAT"
                  value={String(form.vatRate)}
                  onChange={(value) => setForm((p) => ({ ...p, vatRate: Number(value) }))}
                  options={VAT_OPTIONS.map((v) => ({ label: `${v}%`, value: String(v) }))}
                />
              </div>

              <button onClick={addInvoice} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">
                Lưu hóa đơn
              </button>

              <div className="overflow-auto">
                <table className="w-full text-sm border-separate border-spacing-y-1 min-w-[850px]">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="text-left">Số HĐ</th>
                      <th className="text-left">Ngày</th>
                      <th className="text-left">Loại</th>
                      <th className="text-left">Đối tác</th>
                      <th className="text-left">Mặt hàng</th>
                      <th className="text-right">Thành tiền</th>
                      <th className="text-right">VAT</th>
                      <th className="text-right">Tổng cộng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedInvoices.map((invoice) => (
                      <tr key={invoice.id + invoice.date} className="bg-slate-50">
                        <td className="py-2 px-2 font-medium">{invoice.id}</td>
                        <td className="px-2">{invoice.date}</td>
                        <td className="px-2">{invoice.type === 'sale' ? 'Bán ra' : 'Mua vào'}</td>
                        <td className="px-2">{invoice.partner}</td>
                        <td className="px-2">{invoice.item}</td>
                        <td className="text-right px-2">{money.format(invoice.amount)}</td>
                        <td className="text-right px-2">{money.format(invoice.vat)}</td>
                        <td className="text-right px-2 font-semibold">{money.format(invoice.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'inventory' && (
            <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Sổ kho tích hợp từ hóa đơn</h2>
              <div className="overflow-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="text-slate-500 border-b">
                      <th className="text-left py-2">Mặt hàng</th>
                      <th className="text-right py-2">Nhập kho</th>
                      <th className="text-right py-2">Xuất kho</th>
                      <th className="text-right py-2">Tồn kho</th>
                      <th className="text-right py-2">Giá vốn TB</th>
                      <th className="text-right py-2">Giá trị tồn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRows.map((row) => (
                      <tr key={row.item} className="border-b border-slate-100">
                        <td className="py-2">{row.item}</td>
                        <td className="text-right">{decimal.format(row.purchased)}</td>
                        <td className="text-right">{decimal.format(row.sold)}</td>
                        <td className={`text-right font-medium ${row.onHand < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {decimal.format(row.onHand)}
                        </td>
                        <td className="text-right">{money.format(row.avgBuyPrice)}</td>
                        <td className="text-right font-semibold">{money.format(row.stockValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'tax' && (
            <section className="grid lg:grid-cols-3 gap-3">
              <TaxCard title="Báo cáo thuế tháng" report={periodReport.monthly} />
              <TaxCard title="Báo cáo thuế quý" report={periodReport.quarterly} />
              <TaxCard title="Báo cáo thuế năm" report={periodReport.yearly} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>
      <p className="text-xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function TaxCard({
  title,
  report,
}: {
  title: string;
  report: { from: string; count: number; revenue: number; expense: number; vatPayable: number; vatCredit: number; corporateTax: number };
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500">Dữ liệu từ: {report.from}</p>
      <p className="text-sm text-slate-600">Số hóa đơn: <span className="font-medium text-slate-800">{report.count}</span></p>
      <p className="text-sm text-slate-600">Doanh thu chưa VAT: <span className="font-medium text-slate-800">{money.format(report.revenue)}</span></p>
      <p className="text-sm text-slate-600">Chi phí chưa VAT: <span className="font-medium text-slate-800">{money.format(report.expense)}</span></p>
      <p className="text-sm text-slate-600">VAT phải nộp: <span className="font-medium text-amber-700">{money.format(report.vatPayable)}</span></p>
      <p className="text-sm text-slate-600">VAT còn khấu trừ: <span className="font-medium text-emerald-700">{money.format(report.vatCredit)}</span></p>
      <p className="text-sm text-slate-600">Thuế TNDN ước tính: <span className="font-semibold text-indigo-700">{money.format(report.corporateTax)}</span></p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="text-sm text-slate-600 flex flex-col gap-1">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="text-sm text-slate-600 flex flex-col gap-1">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
