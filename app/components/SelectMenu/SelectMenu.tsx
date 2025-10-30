import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Member {
  id: string | number;
  name: string;
}

interface MemberSelectProps {
  members: Member[];
  selectedMember: Member | null;
  onChange: (member: Member | null) => void;
  allowAll?: boolean; // if true, include "All Members" option
}

export default function MemberSelect({ members, selectedMember, onChange, allowAll = false }: MemberSelectProps) {
  const options: (Member | null)[] = allowAll ? [null, ...members] : members;

  return (
    <Listbox value={selectedMember} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="bg-light-grey rounded-xl p-2 w-full text-left text-white cursor-pointer">
          {selectedMember ? selectedMember.name : (allowAll ? "All Members" : "Select a member")}
        </Listbox.Button>

        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 w-full bg-light-grey rounded-xl shadow max-h-60 overflow-auto z-10">
            {options.map((memberOption, idx) => (
              <Listbox.Option
                key={memberOption?.id ?? "all"}
                value={memberOption}
                as={Fragment}
              >
                {({ active, selected }) => (
                  <li
                    className={`p-2 cursor-pointer ${
                      active ? 'bg-light-purple text-black' : 'bg-light-grey text-white'
                    } ${selected ? 'font-semibold' : ''}`}
                  >
                    {memberOption ? memberOption.name : "All Members"}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
