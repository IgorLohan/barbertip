'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface Schedule {
  _id: string;
  startAt: string;
  endAt: string;
  status: string;
  clientId?: {
    name: string;
    email: string;
  };
  serviceId: {
    name: string;
  };
  barberId: {
    userId: {
      name: string;
    };
  };
}

interface CalendarProps {
  schedules: Schedule[];
}

export default function Calendar({ schedules }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Agrupar agendamentos por data
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const dateKey = format(new Date(schedule.startAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });
    return grouped;
  }, [schedules]);

  const getSchedulesForDate = (date: Date): Schedule[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return schedulesByDate[dateKey] || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADO':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      case 'CONCLUIDO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const firstDayOfWeek = getDay(monthStart);

  const selectedSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Calendário de Agendamentos</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Mês anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-gray-900 min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Próximo mês"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Espaços vazios antes do primeiro dia do mês */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Dias do mês */}
        {daysInMonth.map((day) => {
          const daySchedules = getSchedulesForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`aspect-square p-1 rounded-md border-2 transition-colors ${
                isSelected
                  ? 'border-primary-700 bg-primary-100'
                  : isToday
                    ? 'border-blue-500 bg-blue-50'
                    : daySchedules.length > 0
                      ? 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col h-full items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-primary-900' : isToday ? 'text-blue-900' : 'text-gray-900'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {daySchedules.length > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                    isSelected 
                      ? 'bg-primary-700 text-white' 
                      : isToday 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-primary-500 text-white'
                  }`}>
                    {daySchedules.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Lista de agendamentos do dia selecionado */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agendamentos de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          {selectedSchedules.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum agendamento neste dia</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{schedule.serviceId.name}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            schedule.status,
                          )}`}
                        >
                          {schedule.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {schedule.clientId && (
                          <p>
                            <strong>Cliente:</strong> {schedule.clientId.name}
                          </p>
                        )}
                        <p>
                          <strong>Barbeiro:</strong> {schedule.barberId.userId.name}
                        </p>
                        <p>
                          <strong>Horário:</strong>{' '}
                          {format(new Date(schedule.startAt), 'HH:mm', { locale: ptBR })} -{' '}
                          {format(new Date(schedule.endAt), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
