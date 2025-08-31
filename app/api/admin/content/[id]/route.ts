import { NextResponse } from 'next/server';

interface DeleteParams {
  params: {
    id: string;
  };
}

interface GetParams {
  params: {
    id: string;
  };
}

interface PutParams {
  params: {
    id: string;
  };
}

/**
 * 处理删除指定ID内容的请求
 * @param request Request (NextRequest in newer versions, but Request is general)
 * @param params  { params: { id: string } } (Destructured from the second argument)
 * @returns NextResponse
 */
export async function DELETE(request: Request, { params }: DeleteParams) {
  const { id } = params;
  console.log(`[API /admin/content DELETE] Attempting to delete content with id: ${id}`);

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing content ID.' },
      { status: 400 }
    );
  }

  try {
    const result = await sql`DELETE FROM contents WHERE id = ${parseInt(id)} RETURNING id;`;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: `Content with ID ${id} not found.` },
        { status: 404 }
      );
    }

    console.log(`[API /admin/content DELETE] Content with id: ${id} deleted successfully.`);
    return NextResponse.json(
      { success: true, message: 'Content deleted successfully.', data: { id: parseInt(id) } },
      { status: 200 } // 或 204 No Content 如果不返回body
    );

  } catch (error) {
    console.error(`[API /admin/content DELETE] Error deleting content with id: ${id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error while deleting content.', errorDetails: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 处理获取指定ID内容的请求
 * @param request Request
 * @param params { params: { id: string } }
 * @returns NextResponse
 */
export async function GET(request: Request, { params }: GetParams) {
  const { id } = params;
  console.log(`[API /admin/content GET] Attempting to fetch content with id: ${id}`);

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing content ID.' },
      { status: 400 }
    );
  }

  try {
    const result = await sql`
      SELECT id, title, content_type, content_body, status, created_at, updated_at 
      FROM contents 
      WHERE id = ${parseInt(id)};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: `Content with ID ${id} not found.` },
        { status: 404 }
      );
    }

    console.log(`[API /admin/content GET] Content with id: ${id} fetched successfully.`);
    return NextResponse.json(
      { success: true, message: 'Content fetched successfully.', data: result.rows[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error(`[API /admin/content GET] Error fetching content with id: ${id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error while fetching content.', errorDetails: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 处理更新指定ID内容的请求
 * @param request Request
 * @param params { params: { id: string } }
 * @returns NextResponse
 */
export async function PUT(request: Request, { params }: PutParams) {
  const { id } = params;
  console.log(`[API /admin/content PUT] Attempting to update content with id: ${id}`);

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing content ID for update.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { title, contentType, contentBody, status } = body;

    // 基本的验证，确保至少有标题和类型
    if (!title || !contentType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields (title, contentType) for update.' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE contents
      SET 
        title = ${title},
        content_type = ${contentType},
        content_body = ${contentBody},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
      RETURNING id, title, content_type, content_body, status, updated_at;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: `Content with ID ${id} not found for update.` },
        { status: 404 }
      );
    }

    console.log(`[API /admin/content PUT] Content with id: ${id} updated successfully:`, result.rows[0]);
    return NextResponse.json(
      { success: true, message: 'Content updated successfully.', data: result.rows[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error(`[API /admin/content PUT] Error updating content with id: ${id}:`, error);
    if (error instanceof SyntaxError) { // JSON 解析错误
        return NextResponse.json({ success: false, message: 'Invalid JSON payload for update.' }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: 'Internal Server Error while updating content.', errorDetails: (error as Error).message },
      { status: 500 }
    );
  }
} 