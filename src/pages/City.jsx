import React from 'react'
import { Button, InputGroup, Form, Table, Pagination } from 'react-bootstrap'

function City() {
    return (
        <div className="m-1 mt-3 p-1">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold">City</h3>
                <Button
                    variant="primary"
                //   onClick={() => setShowModal(true)}
                >
                    New
                </Button>
            </div>
            <div className='flex'>
                <div className='flex gap-2 mb-1'>
                    {/* Search Bar */}
                    <InputGroup className="mb-0" style={{ width: '300px' }}>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                            placeholder="Search city..."
                        // value={searchTerm}
                        // onChange={handleSearch}
                        />
                    </InputGroup>
                    <Form.Select style={{ width: '150px' }}>
                        <option value="en">English</option>
                        <option value="gu">ગુજરાતી</option>
                        <option value="hi">हिंदी</option>
                    </Form.Select>
                    <Form.Select style={{ width: '150px' }}>
                        <option value="">Select city</option>
                    </Form.Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table striped bordered hover responsive className='pb-0'>
                    <thead>
                        <tr>
                            <th></th>
                            <th
                            >
                                Name
                            </th>
                            <th
                            >
                                Polygon
                            </th>
                            <th
                            >
                                Total Users
                            </th>
                            <th>Post/Questions</th>
                            <th>Location</th>
                            <th>Languages</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="8" className="text-center text-danger py-4">{error}</td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No categories found</td>
                            </tr>
                        ) : ( */}
                        <tr>
                            <td className='text-center'>
                                <input
                                    type="checkbox"
                                    className='h-5 w-5 mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                // checked={selectedCategories.includes(category.id)}
                                // onChange={() => handleCheckboxChange(category.id)}
                                />
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                                <Button
                                    variant="danger"
                                    size="sm"
                                // onClick={() => handleDelete(category.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                        {/* )} */}
                    </tbody>
                </Table>
            </div>
            {/* Pagination */}
            <div className='flex justify-between items-center'>
                {/* Pagination */}
                <Pagination className='mb-0'>
                    <Pagination.First
                    // onClick={() => handlePageChange(1)}
                    // disabled={pagination.page === 1}
                    />
                    <Pagination.Prev
                    // onClick={() => handlePageChange(pagination.page - 1)}
                    // disabled={pagination.page === 1}
                    />
                    {[...Array(Math.min(5)).keys()].map(num => {
                        const pageNum = num + 1;
                        return (
                            <Pagination.Item
                                key={pageNum}
                            // active={pageNum === pagination.page}
                            // onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </Pagination.Item>
                        );
                    })}
                    <Pagination.Next
                    // onClick={() => handlePageChange(pagination.page + 1)}
                    // disabled={pagination.page === pagination.totalPages}
                    />
                    <Pagination.Last
                    // onClick={() => handlePageChange(pagination.totalPages)}
                    // disabled={pagination.page === pagination.totalPages}
                    />
                </Pagination>

                {/* Rows Per Page Dropdown */}
                <Form.Select
                    as="select"
                    style={{ width: '150px' }}
                    // value={pagination.limit}
                    // onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                    className='mb-1'
                >
                    <option value="5">Data Show 5</option>
                    <option value="10">Data Show 10</option>
                    <option value="25">Data Show 25</option>
                    <option value="50">Data Show 50</option>
                </Form.Select>
            </div>
        </div>
    )
}

export default City;
