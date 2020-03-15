/*
 * Copyright 2018 datagear.tech. All Rights Reserved.
 */

package org.datagear.persistence.dialect;

import java.sql.Connection;

import org.datagear.connection.URLSensor;
import org.datagear.connection.support.SqlServerURLSensor;
import org.datagear.persistence.AbstractURLSensedDialectBuilder;
import org.datagear.persistence.Dialect;
import org.datagear.persistence.DialectBuilder;

/**
 * SqlServer的{@linkplain DialectBuilder}。
 * 
 * @author datagear@163.com
 *
 */
public class SqlServerDialectBuilder extends AbstractURLSensedDialectBuilder
{
	public SqlServerDialectBuilder()
	{
		super(new SqlServerURLSensor());
	}

	@Override
	public void setUrlSensor(URLSensor urlSensor)
	{
		throw new UnsupportedOperationException();
	}

	@Override
	public Dialect build(Connection cn)
	{
		return new SqlServerDialect(getIdentifierQuote(cn));
	}
}