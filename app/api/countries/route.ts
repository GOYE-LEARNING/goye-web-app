export async function GET() {
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries");

    if (!res.ok) {
      return Response.json(
        { message: "Failed to fetch damn countries" },
        { status: res.status }
      );
    }

    const data = await res.json();

    return Response.json(
      {
        message: "Countries loaded successfully",
        countries: data.data || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Server error fetching countries" },
      { status: 500 }
    );
  }
}
