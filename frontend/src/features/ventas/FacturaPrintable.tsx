import { useRef } from 'react';

export default function FacturaPrintable({ venta }: { venta: any }) {
  if (!venta) return null;

  return (
    <div className="bg-white text-black p-4 w-full max-w-[80mm] mx-auto font-mono text-[12px] leading-tight print-section" id="factura-printable">
      <div className="flex flex-col items-center text-center mb-4">
        <img src="/brand/colmao-logo.svg" alt="Colmao" className="h-8 mb-2 object-contain grayscale" />
        <p>Av. Principal #123, Santo Domingo</p>
        <p>Tel: 809-555-0000</p>
        <p>RNC: 130-123456-1</p>
      </div>

      <div className="border-t border-b border-black py-2 mb-3 border-dashed">
        <p><span className="font-bold">FACTURA:</span> {venta.numeroFactura || `INV-${String(venta.id).padStart(6, '0')}`}</p>
        <p><span className="font-bold">NCF:</span> {venta.ncf || `B02${String(venta.id).padStart(8, '0')}`}</p>
        <p><span className="font-bold">FECHA:</span> {new Date(venta.fecha).toLocaleString()}</p>
        <p><span className="font-bold">CAJERO:</span> {venta.usuario?.nombre || 'Cajero'}</p>
        <p><span className="font-bold">CLIENTE:</span> {venta.cliente?.nombre || 'Consumidor Final'}</p>
        <p><span className="font-bold">PAGO:</span> {venta.tipoPago.toUpperCase()}</p>
      </div>

      <table className="w-full mb-3 text-left border-collapse">
        <thead>
          <tr className="border-b border-black border-dashed">
            <th className="pb-1 font-bold">CANT</th>
            <th className="pb-1 font-bold">DESCRIPCIÓN</th>
            <th className="pb-1 font-bold text-right">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          {venta.items?.map((item: any) => (
            <tr key={item.id}>
              <td className="py-1 align-top">{Number(item.cantidad)}</td>
              <td className="py-1 px-1 align-top break-words">
                {item.nombre}
                <div className="text-[10px] text-gray-600">RD${Number(item.precioUnitario).toFixed(2)}</div>
              </td>
              <td className="py-1 text-right align-top">RD${Number(item.importe).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black border-dashed pt-2 space-y-1 text-right mb-4">
        <p>BASE IMPONIBLE: RD${Number(venta.subtotal).toFixed(2)}</p>
        <p>ITBIS (18%): RD${Number(venta.itbis).toFixed(2)}</p>
        <p className="font-bold text-sm mt-1">TOTAL: RD${Math.round(Number(venta.total))}</p>
        
        {venta.tipoPago === 'efectivo' && venta.montoRecibido && (
          <>
            <p className="mt-2">EFECTIVO: RD${Math.round(Number(venta.montoRecibido))}</p>
            <p>CAMBIO: RD${Math.round(Number(venta.cambio))}</p>
          </>
        )}
      </div>

      <div className="text-center mt-6">
        <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
        <p className="mt-1 text-[10px]">Factura de Demostración</p>
      </div>
    </div>
  );
}
