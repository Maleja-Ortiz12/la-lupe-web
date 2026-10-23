import { contact, telUrl } from '@/shared/config/contact';
import { ActionIcon } from './action-icon';

// Owner-supplied phones as call links plus the delivery coverage; shared by home, visit page and footer.
export function ContactPhones({ className = 'contact-phones' }: { className?: string }) {
  return (
    <div className={className}>
      <ul aria-label="Teléfonos de contacto">
        {contact.phones.map(phone => (
          <li key={phone}><a href={telUrl(phone)}><ActionIcon kind="phone" /><span><span className="visually-hidden">Llamar al </span>{phone}</span></a></li>
        ))}
      </ul>
      <p className="contact-delivery"><ActionIcon kind="delivery" /><span>{contact.delivery}</span></p>
    </div>
  );
}
