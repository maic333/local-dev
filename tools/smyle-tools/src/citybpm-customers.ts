import axios from 'axios';

export async function fetchCustomersPage2() {
  const response = await axios.get(
    'https://web.citybpm.com/business/manager/consumers',
    {
      params: {
        ufauk: '1X1PJY3A5Z-20260404164714771-1775321234-1775321236-2',
        page: 2,
        _: 1775321234282,
      },
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        cookie: [
          'i18n_language=ro',
          '_ga=GA1.1.329198185.1775310941',
          'CityBpm=t89e68p37fbd63k6eo5o4f6q9u',
          'remember=Q2FrZQ%3D%3D.YjAzNDk2NTkxMmRhMWRkZDlhZWU2NDU2NGQ2ZWZjYTBhOTIyZDk1NDg3ZDUzYTJmYThjN2UzNzMxYzEzZjRhOT%2B%2F4bivkD2MG1Q8EpVeeGTnIC47FokPAp1YNscY9trQh%2BNsdMS%2FsXQlk2j970AsJAcWUrqLF0FT%2BawR12x7wT7HpwZnFv%2FCJBfkx1pS6QPj1XVKfDRqwGwmsNuZefnIhWhMt9v5amB4FdtK0i8GfjXfYSpYP9VvHnQZQlmEFGO2dBILnKlHFnkvPWaJ2rw1d%2FzrCV2j5NRiQNmwKSfj5djqnOZYcLrdCNZAjzwjTaEFt7cZuIcgBtuFv4Zfy18zNjcyY%2BoNr2GGUPQ14u4RxAg0zJsJ1WnVMENEaTvIsiCeAHF4WgWx0tMV%2Be4tXQseyIj7veTm6zjTAyVV4zmAIIRqt9U%2FWq7nDs4wPuYrtdRV%2BRPOyIdI8qAytYvpw8smIxsJ%2BaYUQTL1MIH4AI88HsJm%2FgKlcxnvP%2FRf7ibVf0SpMl7Xx4BBI8fxnchc1s4tWGZg0p4%2B9Nhet%2FPKAqmSB7HqkzUsCrZNKuVCGKHasYrUMH3S1SIGzR%2BqP52yOjVrwu5d0hMu7neufbj41RAcBArXbryeR23FGV5maOm%2BO7WiVE3wx8BImAUyTKasiqXmbJJSBSttwZKTPIKrRvYMtpV%2FeSiQLIt7f48OSHjzCW6%2FTYVb7mTE3VeA8DDSH3U5H44zlw9aKgSeGUFMjeJdHnX8W%2BxOcg%2FxhNdKEi9tUTnDK6jPVZ2uoXWFef15XmPb9tuBPHklR1ecICPKbEVReCa6a8qtJb3PFH3KXLkMYmx7AK1zx8p2nVUmOKDB9Jg5rK5A8SqDbOR4uusd1ioF8mw4KpxOmw3CNuKA%2FVma%2FhP1xuFpVddZTQgzorMMTNXp68qORRIwkSNrFOgPN%2B99HfYd5EjpckqEXqC3jhXLRySbfxTfIi61jrxKElQDH8GGBmMWAUVZv0Kxa%2BeLVN2wVwt%2BRYXIIAhwml1wFEmPMoU16WTY0s81ojyEyXcGe7htI87vtqmZVE2607VYTRRDZu9k0QVSYXIlhU0E%2BOv4RLazboE7yVbcHWFwB8xEgMCNUpOgcmHKGHKYqQlmfQCVIpWjBg4iR8Q7ByXuptcpQbwQ',
          'menu_style=expanded',
          'environment_width=1728',
          'environment_height=1117',
        ].join('; '),
      },
    }
  );

  return response.data;
}

function responseToString(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

async function main() {
  const data = await fetchCustomersPage2();
  const text = responseToString(data);
  console.log(text.slice(0, 2000));
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
