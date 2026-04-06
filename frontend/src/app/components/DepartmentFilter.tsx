import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const DEPARTMENTS = [
  'Todos los departamentos',
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa'
];

interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DepartmentFilter({ value, onChange }: DepartmentFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-[#4997D0]" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[200px] bg-background border-border text-sm">
          <SelectValue placeholder="Filtrar por departamento" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((department) => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
